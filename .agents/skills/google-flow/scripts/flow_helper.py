#!/usr/bin/env python3
"""Google Flow Production CLI Helper.

Stdlib-only, deterministic CLI utility for Google Flow operations:
- Credit estimation with peak/off-peak logic
- 5-element prompt formulation
- Character rig validation
- Storyboard pipeline validation
- Video Quality Control (QC) scoring & thresholding
- Hallucination diagnostic & prescriptive auto-remediation
- Production QC checklist generation
"""

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sys

MODEL_RATES = {
    "veo-3.1-quality": {"rate": 10.0, "type": "per_second", "max_dur": 60},
    "veo-3.1-fast": {"rate": 5.0, "type": "per_second", "max_dur": 30},
    "veo-3.1-lite": {"rate": 2.0, "type": "per_second", "max_dur": 15},
    "gemini-omni-flash-720p": {"rate": 1.0, "type": "per_second", "max_dur": 60},
    "gemini-omni-flash-360p": {"rate": 0.5, "type": "per_second", "max_dur": 60},
    "nano-banana-pro": {"rate": 5.0, "type": "per_image", "max_dur": 0},
    "nano-banana-2": {"rate": 2.0, "type": "per_image", "max_dur": 0},
    "nano-banana-2-lite": {"rate": 0.8, "type": "per_image", "max_dur": 0},
}

REQUIRED_8_ANGLES = [
    "front",
    "three_quarter_left",
    "profile_left",
    "back_left",
    "back",
    "back_right",
    "profile_right",
    "three_quarter_right",
]

DEFECT_DIAGNOSIS = {
    "anatomy": {
        "defect_class": "Class A: Anatomical Hallucination",
        "description": "Melting facial features, extra/missing digits, fused appendages, disfigured joints.",
        "root_cause": "Overloaded concurrent hand/face micro-gestures confusing spatial diffusion latents.",
        "remediation_steps": [
            "Action Isolation: Split complex gestures into separate sequential medium and macro close-up shots.",
            "Inject negative prompt tokens targeting anatomical disfigurement.",
            "Escalate model to veo-3.1-quality or lock keyframe still with nano-banana-pro first."
        ],
        "negative_prompt_injection": "extra limbs, extra fingers, missing fingers, fused digits, deformed hands, unnatural anatomy, asymmetrical face, melting facial features, detached appendages, wax mannequin skin",
        "prompt_advice": "Describe posture cleanly. Do not ask for simultaneous intricate finger tasks in wide shots.",
        "recommended_model": "veo-3.1-quality"
    },
    "flicker": {
        "defect_class": "Class B: Temporal Glitch & Illumination Strobe",
        "description": "High-frequency strobe flickering, frame-to-frame jitter, background geometry warping.",
        "root_cause": "High-frequency variance in ambient lighting or excessive camera velocity delta across frames.",
        "remediation_steps": [
            "Execute flow_upscale_media with apply_deflicker: true (multi-frame optical flow filter).",
            "Reduce camera velocity instructions (e.g. use 'smooth steady glide' instead of 'whip pan').",
            "Clamp continuity by feeding previous shot final frame as anchor_frame with 12 blend frames."
        ],
        "negative_prompt_injection": "temporal jitter, strobe flickering, frame strobing, warping geometry, erratic light flashes, shutter tearing",
        "prompt_advice": "Specify constant steady illumination (e.g. 'diffused soft ambient studio light at 3200K').",
        "recommended_model": "flow_upscale_media (apply_deflicker=True)"
    },
    "text": {
        "defect_class": "Class C: Text & Watermark Hallucination",
        "description": "Pseudo-alphabetic glyphs, garbled typography on signs, synthetic logos or subtitles.",
        "root_cause": "Diffusion backbone hallucinating written characters from semantic sign descriptions.",
        "remediation_steps": [
            "Inject strict exclusion tokens into negative prompt.",
            "Strip all explicit text words from generation prompt (replace with atmospheric description).",
            "Composite authentic graphic titles and typography in post-production."
        ],
        "negative_prompt_injection": "text, typography, letters, alphabet, words, subtitles, captions, watermark, logo, trademark, brand stamp, UI overlay, HUD symbols",
        "prompt_advice": "Never specify exact readable words. Use visual descriptions like 'illuminated glowing neon storefront sign in warm amber'.",
        "recommended_model": "veo-3.1-fast"
    },
    "physics": {
        "defect_class": "Class D: Kinematic & Physics Violations",
        "description": "Sliding feet (moonwalking), object clipping/phase-through, inverted fluid gravity.",
        "root_cause": "Lightweight model tier running simplified spatio-temporal dynamics approximations.",
        "remediation_steps": [
            "Escalate generation tier to veo-3.1-quality (native 3D spatio-temporal physics attention).",
            "Reinforce surface contact mechanics in prompt (e.g. 'firmly planted footsteps pressing damp earth').",
            "Explicitly define physical kinetics (e.g. 'dense viscous liquid dripping downward under gravity')."
        ],
        "negative_prompt_injection": "unnatural physics, floating objects, sliding feet, foot sliding, phase through solid matter, inverted gravity, erratic acceleration",
        "prompt_advice": "Explicitly state physical momentum and weight grounding in the action description.",
        "recommended_model": "veo-3.1-quality"
    },
    "drift": {
        "defect_class": "Class E: Identity & Style Mutation Across Cuts",
        "description": "Character face changing across shots, costume color morphing, lighting temperature shift.",
        "root_cause": "Unconditioned generation across cuts without seed locking or reference rig embeddings.",
        "remediation_steps": [
            "Inject the persistent character_rig_id generated via nano-banana-pro 8-angle rig.",
            "Lock the generator seed across contiguous sequence cuts.",
            "Pass final frame of prior shot as anchor_frame for the next shot."
        ],
        "negative_prompt_injection": "face morphing, costume change, wardrobe mutation, inconsistent character identity, style drift",
        "prompt_advice": "Prepend character identifier token and reuse exact wardrobe descriptors verbatim.",
        "recommended_model": "flow_create_character_rig (nano-banana-pro)"
    }
}


def is_off_peak_now() -> tuple[bool, str]:
    now_utc = datetime.now(timezone.utc)
    hour = now_utc.hour
    if 2 <= hour < 8:
        return True, f"Current UTC hour {hour:02d}:00 is within Off-Peak window (02:00-08:00 UTC). Eligible for 30% discount."
    if 14 <= hour < 22:
        return False, f"Current UTC hour {hour:02d}:00 is within Peak window (14:00-22:00 UTC). Standard 1.0x rate applies."
    return False, f"Current UTC hour {hour:02d}:00 is shoulder period. Standard 1.0x rate applies."


def estimate_cost(model: str, duration: float, count: int, force_peak: bool = None) -> dict:
    if model not in MODEL_RATES:
        raise ValueError(f"Unknown model '{model}'. Valid models: {list(MODEL_RATES.keys())}")

    spec = MODEL_RATES[model]
    if spec["type"] == "per_second":
        base_credits = spec["rate"] * duration * count
    else:
        base_credits = spec["rate"] * count

    if force_peak is None:
        off_peak, reason = is_off_peak_now()
    else:
        off_peak = not force_peak
        reason = "Off-Peak manually forced" if off_peak else "Peak manually forced"

    discount_rate = 0.30 if off_peak else 0.0
    final_credits = base_credits * (1.0 - discount_rate)

    return {
        "model": model,
        "type": spec["type"],
        "units": duration if spec["type"] == "per_second" else count,
        "count": count,
        "base_credits": round(base_credits, 2),
        "discount_applied": f"{int(discount_rate * 100)}%",
        "final_estimated_credits": round(final_credits, 2),
        "timing_note": reason,
    }


def format_prompt(subject: str, environment: str, cinematography: str, lighting: str, style: str) -> str:
    elements = [
        subject.strip().rstrip("."),
        environment.strip().rstrip("."),
        cinematography.strip().rstrip("."),
        lighting.strip().rstrip("."),
        style.strip().rstrip("."),
    ]
    cleaned = [el for el in elements if el]
    return ". ".join(cleaned) + "."


def validate_rig_file(file_path: Path) -> dict:
    if not file_path.exists():
        return {"valid": False, "error": f"File not found: {file_path}"}

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as exc:
        return {"valid": False, "error": f"JSON parse failure: {exc}"}

    missing_fields = [k for k in ["rig_id", "name", "description", "art_style", "angles"] if k not in data]
    if missing_fields:
        return {"valid": False, "error": f"Missing required top-level fields: {missing_fields}"}

    angles = data.get("angles", {})
    missing_angles = [a for a in REQUIRED_8_ANGLES if a not in angles]
    if missing_angles:
        return {"valid": False, "error": f"Missing canonical angles: {missing_angles}"}

    return {"valid": True, "rig_id": data.get("rig_id"), "name": data.get("name"), "angle_count": len(angles)}


def validate_storyboard_file(file_path: Path) -> dict:
    if not file_path.exists():
        return {"valid": False, "error": f"File not found: {file_path}"}

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as exc:
        return {"valid": False, "error": f"JSON parse failure: {exc}"}

    if "shots" not in data or not isinstance(data["shots"], list):
        return {"valid": False, "error": "Storyboard must include a 'shots' array"}

    total_duration = 0.0
    total_credits = 0.0
    shot_reports = []

    for idx, shot in enumerate(data["shots"]):
        shot_num = shot.get("shot_number", idx + 1)
        model = shot.get("model", "veo-3.1-quality")
        duration = float(shot.get("duration_seconds", 5.0))
        prompt = shot.get("prompt", "")

        if model not in MODEL_RATES:
            return {"valid": False, "error": f"Shot {shot_num}: unknown model '{model}'"}

        rate = MODEL_RATES[model]["rate"]
        shot_cost = rate * duration
        total_duration += duration
        total_credits += shot_cost

        shot_reports.append({
            "shot_number": shot_num,
            "model": model,
            "duration": duration,
            "prompt_chars": len(prompt),
            "estimated_credits": round(shot_cost, 2),
        })

    return {
        "valid": True,
        "project_name": data.get("project_name", "Untitled"),
        "total_shots": len(data["shots"]),
        "total_duration_seconds": round(total_duration, 2),
        "total_estimated_credits": round(total_credits, 2),
        "shots": shot_reports,
    }


def audit_quality(temporal: float, anatomy: float, semantic: float, artifacts: float, physics: float) -> dict:
    # 5-Dimensional weighted composite score
    composite = round(
        (0.25 * temporal) +
        (0.25 * anatomy) +
        (0.20 * semantic) +
        (0.15 * artifacts) +
        (0.15 * physics),
        2
    )

    dimensions = {
        "temporal_stability": {"score": temporal, "weight": "25%", "benchmark": 85, "pass": temporal >= 85},
        "anatomical_integrity": {"score": anatomy, "weight": "25%", "benchmark": 90, "pass": anatomy >= 90},
        "semantic_adherence": {"score": semantic, "weight": "20%", "benchmark": 85, "pass": semantic >= 85},
        "artifact_suppression": {"score": artifacts, "weight": "15%", "benchmark": 95, "pass": artifacts >= 95},
        "physical_coherence": {"score": physics, "weight": "15%", "benchmark": 80, "pass": physics >= 80},
    }

    failed_dims = [k for k, v in dimensions.items() if not v["pass"]]

    if composite >= 85.0 and len(failed_dims) == 0:
        status = "APPROVED"
        recommendation = "Pristine output quality. Approved for Scenebuilder assembly, audio sync, and ProRes mastering."
    elif composite >= 70.0:
        status = "NEEDS_REMEDIATION"
        recommendation = f"Minor localized defects detected in: {', '.join(failed_dims)}. Apply targeted auto-remediation (de-flicker or single-seed re-roll)."
    else:
        status = "CRITICAL_FAILURE"
        recommendation = f"Severe hallucination or collapse in: {', '.join(failed_dims)}. Reject output. Apply prompt de-crowding and negative prompt reinforcement."

    return {
        "status": status,
        "composite_qc_score": composite,
        "passed": status == "APPROVED",
        "dimensions": dimensions,
        "failed_dimensions": failed_dims,
        "recommendation": recommendation,
    }


def diagnose_fix(defect: str, input_prompt: str = "") -> dict:
    key = defect.lower().strip()
    # Map synonyms
    synonym_map = {
        "anatomy": "anatomy", "hands": "anatomy", "face": "anatomy", "limbs": "anatomy",
        "flicker": "flicker", "jitter": "flicker", "strobing": "flicker", "warp": "flicker",
        "text": "text", "letters": "text", "watermark": "text", "logo": "text",
        "physics": "physics", "sliding": "physics", "fluid": "physics", "clipping": "physics",
        "drift": "drift", "costume": "drift", "consistency": "drift", "identity": "drift",
    }

    canonical_key = synonym_map.get(key, key)
    if canonical_key not in DEFECT_DIAGNOSIS:
        raise ValueError(f"Unknown defect '{defect}'. Valid choices: {list(DEFECT_DIAGNOSIS.keys())}")

    diag = DEFECT_DIAGNOSIS[canonical_key].copy()

    if input_prompt:
        # Provide corrected prompt preview
        diag["original_prompt"] = input_prompt
        diag["remediation_preview"] = f"{input_prompt.strip().rstrip('.')}."
        diag["recommended_negative_prompt"] = diag["negative_prompt_injection"]

    return diag


def get_qc_checklist() -> dict:
    return {
        "google_flow_video_qc_checklist": [
            {"gate": "Gate 1: Temporal Coherence", "criterion": "No high-frequency lighting flicker or background geometric warping across cuts.", "threshold": "Temporal >= 85"},
            {"gate": "Gate 2: Anatomical Integrity", "criterion": "Human/character subjects maintain 5 fingers per hand, natural facial symmetry, no morphing joints.", "threshold": "Anatomy >= 90"},
            {"gate": "Gate 3: Semantic Fidelity", "criterion": "Subject kinematic action, camera trajectory (dolly/pan/orbit), and lighting palette strictly match prompt.", "threshold": "Semantic >= 85"},
            {"gate": "Gate 4: Typography Exclusion", "criterion": "Zero hallucinated pseudo-alphabets, garbled signboards, watermarks, or HUD overlays in frame.", "threshold": "Artifacts >= 95"},
            {"gate": "Gate 5: Physical Plausibility", "criterion": "Feet firmly grounded (no moonwalking slide), solid collision physics, natural fluid gravity at 24fps.", "threshold": "Physics >= 80"},
        ],
        "decision_rule": "Composite QC >= 85 to approve; 70-84 execute targeted auto-fix; < 70 reject and re-roll."
    }


def main():
    parser = argparse.ArgumentParser(description="Google Flow Production Helper")
    subparsers = parser.add_subparsers(dest="subcommand", required=True)

    # estimate-cost
    p_est = subparsers.add_parser("estimate-cost", help="Estimate credits for a model run")
    p_est.add_argument("--model", required=True, choices=list(MODEL_RATES.keys()), help="Model ID")
    p_est.add_argument("--duration", type=float, default=5.0, help="Duration in seconds")
    p_est.add_argument("--count", type=int, default=1, help="Quantity or iterations")
    p_est.add_argument("--peak", action="store_true", default=None, help="Force peak calculation")
    p_est.add_argument("--off-peak", dest="off_peak", action="store_true", default=None, help="Force off-peak calculation")

    # check-peak
    subparsers.add_parser("check-peak", help="Check current UTC peak/off-peak pricing status")

    # format-prompt
    p_prompt = subparsers.add_parser("format-prompt", help="Build a 5-element cinematic prompt")
    p_prompt.add_argument("--subject", required=True, help="Subject and physical action")
    p_prompt.add_argument("--environment", required=True, help="Setting, architecture, atmosphere")
    p_prompt.add_argument("--cinematography", required=True, help="Lens, shot size, and camera motion")
    p_prompt.add_argument("--lighting", required=True, help="Lighting setup and color palette")
    p_prompt.add_argument("--style", required=True, help="Film stock, camera sensor, texture")

    # validate-rig
    p_vrig = subparsers.add_parser("validate-rig", help="Validate a Character Rig JSON file")
    p_vrig.add_argument("file", help="Path to rig JSON file")

    # validate-storyboard
    p_vsb = subparsers.add_parser("validate-storyboard", help="Validate a Storyboard JSON file")
    p_vsb.add_argument("file", help="Path to storyboard JSON file")

    # audit-quality
    p_qc = subparsers.add_parser("audit-quality", help="Perform 5-dimensional Video QC audit")
    p_qc.add_argument("--temporal", type=float, default=85.0, help="Temporal stability score (0-100)")
    p_qc.add_argument("--anatomy", type=float, default=90.0, help="Anatomical integrity score (0-100)")
    p_qc.add_argument("--semantic", type=float, default=85.0, help="Semantic adherence score (0-100)")
    p_qc.add_argument("--artifacts", type=float, default=95.0, help="Artifact/text suppression score (0-100)")
    p_qc.add_argument("--physics", type=float, default=80.0, help="Physical coherence score (0-100)")

    # diagnose-fix
    p_diag = subparsers.add_parser("diagnose-fix", help="Prescribe targeted remediation for a defect")
    p_diag.add_argument("--defect", required=True, help="Defect type (anatomy, flicker, text, physics, drift)")
    p_diag.add_argument("--prompt", default="", help="Optional prompt to remediate")

    # qc-checklist
    subparsers.add_parser("qc-checklist", help="Generate production QC inspection checklist")

    args = parser.parse_args()

    if args.subcommand == "estimate-cost":
        force_peak = None
        if args.peak:
            force_peak = True
        elif args.off_peak:
            force_peak = False
        res = estimate_cost(args.model, args.duration, args.count, force_peak)
        print(json.dumps(res, indent=2))

    elif args.subcommand == "check-peak":
        off_peak, msg = is_off_peak_now()
        out = {"off_peak_active": off_peak, "message": msg, "timestamp_utc": datetime.now(timezone.utc).isoformat()}
        print(json.dumps(out, indent=2))

    elif args.subcommand == "format-prompt":
        final_prompt = format_prompt(args.subject, args.environment, args.cinematography, args.lighting, args.style)
        out = {"formatted_prompt": final_prompt, "character_count": len(final_prompt)}
        print(json.dumps(out, indent=2))

    elif args.subcommand == "validate-rig":
        res = validate_rig_file(Path(args.file))
        print(json.dumps(res, indent=2))
        if not res.get("valid"):
            sys.exit(1)

    elif args.subcommand == "validate-storyboard":
        res = validate_storyboard_file(Path(args.file))
        print(json.dumps(res, indent=2))
        if not res.get("valid"):
            sys.exit(1)

    elif args.subcommand == "audit-quality":
        res = audit_quality(args.temporal, args.anatomy, args.semantic, args.artifacts, args.physics)
        print(json.dumps(res, indent=2))
        if not res.get("passed"):
            sys.exit(2 if res.get("status") == "CRITICAL_FAILURE" else 0)

    elif args.subcommand == "diagnose-fix":
        res = diagnose_fix(args.defect, args.prompt)
        print(json.dumps(res, indent=2))

    elif args.subcommand == "qc-checklist":
        res = get_qc_checklist()
        print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()

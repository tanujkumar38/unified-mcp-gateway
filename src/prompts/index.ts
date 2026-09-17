import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { logger } from "../utils/logger.js";

export function registerPrompts(server: McpServer): void {
  logger.info("Registering Google Flow Professional MCP prompts...");

  // 1. Direct Cinematic Scene Prompt
  server.prompt(
    "flow_direct_cinematic_scene",
    "Guides the AI in constructing a professional 5-element prompt for Veo 3.1 or Gemini Omni Flash with camera directions, lighting, and native audio cues.",
    {
      scene_concept: z.string().describe("The core narrative action or scene concept"),
      mood: z.string().optional().describe("Atmosphere or emotional tone (e.g. suspenseful, ethereal, energetic)"),
      genre: z.string().optional().describe("Genre (e.g. sci-fi, noir, period drama, anime)"),
    },
    (args) => {
      const { scene_concept, mood = "cinematic", genre = "dramatic" } = args;
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `You are an expert film director generating a production prompt blueprint for Google Flow's Veo 3.1 video model.

Scene Concept: "${scene_concept}"
Mood: ${mood}
Genre: ${genre}

Please construct a professional prompt using Google Flow's 5-element framework:
1. **Subject & Physical Action**: Specific physical movement, posture, and wardrobe.
2. **Environment & Atmosphere**: Setting, depth layers (foreground/midground/background), and weather.
3. **Lighting & Optical Texture**: Lens focal length (e.g. 35mm anamorphic, 50mm prime), lighting setup (e.g. Rembrandt, chiaroscuro, golden hour rim lighting).
4. **Cinematic Camera Movement**: Specific motion path (e.g. slow dolly forward, 360 orbit, crane elevation).
5. **Synchronized Native Audio Cue**: Dialogue, ambient environmental sound, and subtle score crescendo.

Provide the complete unified prompt ready for 'google_flow_generate_video'.`,
            },
          },
        ],
      };
    }
  );

  // 2. Action Sequence Blueprint
  server.prompt(
    "flow_action_sequence",
    "Constructs a high-impact action sequence prompt with dynamic camera tracking, rapid momentum, and coordinated physics.",
    {
      action_type: z.string().describe("Type of action (e.g. car chase, parkour roof chase, sword duel)"),
      character_ref: z.string().optional().describe("Character tag (e.g. '@Hero', '@Villain')"),
    },
    (args) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate an action movie prompt blueprint for Google Flow:
Action: "${args.action_type}"
Character: ${args.character_ref || "a determined protagonist"}

Include:
- Rapid tracking camera movement matching subject speed.
- Dynamic physical interactions, near-misses, and particle physics (sparks, dust, water spray).
- High-contrast dramatic lighting with lens flares.
- High-energy audio cues: roaring engine, shattering glass, or clashing blades with orchestral percussion.`,
            },
          },
        ],
      };
    }
  );

  // 3. Dialogue Scene Blueprint
  server.prompt(
    "flow_dialogue_scene",
    "Generates a multi-character dialogue scene prompt with over-the-shoulder framing and native voice references.",
    {
      characters: z.string().describe("Characters involved (e.g. '@Sarah and @James')"),
      topic_or_conflict: z.string().describe("Emotional core or subject of conversation"),
      setting: z.string().describe("Location (e.g. cozy Parisian cafe, dimly lit police interrogation room)"),
    },
    (args) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a character-driven dialogue scene prompt for Google Flow:
Characters: ${args.characters}
Setting: ${args.setting}
Emotional Core: ${args.topic_or_conflict}

Structure:
- Medium close-up, over-the-shoulder framing alternating between characters.
- Natural facial micro-expressions and eye contact.
- Soft key lighting with gentle fill, 85mm portrait lens with creamy background bokeh.
- Synchronized clear dialogue audio cue with subtle ambient room tone.`,
            },
          },
        ],
      };
    }
  );

  // 4. Commercial Product Showcase
  server.prompt(
    "flow_product_commercial",
    "Creates a commercial product showcase prompt with 360-degree orbit, studio softbox lighting, and premium macro texture.",
    {
      product_name: z.string().describe("Product name and type (e.g. 'luxury automatic wristwatch', 'sleek flagship smartphone')"),
      key_features: z.string().describe("Specific physical features to highlight (e.g. sapphire glass, titanium beveled edge)"),
    },
    (args) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a commercial product presentation prompt for Google Flow:
Product: ${args.product_name}
Highlights: ${args.key_features}

Specify:
- Slow 360-degree rotational tracking shot or macro sweep on a clean studio turntable.
- Studio softbox rim lighting catching metallic and glass reflections.
- Minimalist background with subtle depth of field.
- Crisp ambient sound design: subtle mechanical clicks or futuristic chime with gentle luxury synth score.`,
            },
          },
        ],
      };
    }
  );

  // 5. Veo 3.1 Prompt Enhancer
  server.prompt(
    "flow_veo_prompt_enhancer",
    "Enhances a simple user prompt into an optimized blueprint leveraging Veo 3.1's high-fidelity video and native audio capabilities.",
    {
      raw_prompt: z.string().describe("Simple text prompt to optimize"),
    },
    (args) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please optimize this raw prompt for Google Flow (Veo 3.1):
"${args.raw_prompt}"

Enhance it with:
- Photorealistic visual descriptors avoiding forbidden buzzwords (like 'hyperrealistic', use physical optical details instead).
- Distinct foreground, midground, and background layers.
- Specified camera focal length (e.g. 50mm f/1.8).
- Clear camera motion path.
- Synchronized sound effects and ambient noise.`,
            },
          },
        ],
      };
    }
  );

  // 6. Storyboard Script Parser
  server.prompt(
    "flow_storyboard_planner",
    "Deconstructs a script or screenplay into a sequential 3-to-5 shot plan ready for Scenebuilder.",
    {
      script_or_story: z.string().describe("Story or script synopsis to divide into sequential shots"),
    },
    (args) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Break down the following story into a 3-shot or 4-shot storyboard sequence for Google Flow's Scenebuilder:

Story:
"${args.script_or_story}"

For each shot, specify:
- Shot # (1, 2, 3...)
- Shot Type (EWS, WS, MS, CU)
- Duration (4s, 6s, 8s, or 10s)
- Continuity Link: How the first frame matches the last frame of the previous shot
- Camera Motion & Lens
- Veo 3.1 Prompt ready for execution`,
            },
          },
        ],
      };
    }
  );

  logger.info("Google Flow Professional prompts registered successfully");
}

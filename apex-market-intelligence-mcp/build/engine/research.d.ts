import { IntakeRequirements, VectorAResult, CompetitorProfile, VectorBResult, VectorCResult, VectorDResult, VectorEResult, VectorFResult, MarketGap } from "../types.js";
/**
 * Validates and completes Step 0 Requirement Intake
 */
export declare function validateAndEnforceIntake(params: Partial<IntakeRequirements>): {
    intake: IntakeRequirements;
    warnings: string[];
    missingMandatory: string[];
};
/**
 * VECTOR A: Geospatial & Competitor Intelligence
 */
export declare function auditVectorAGeospatial(intake: IntakeRequirements): VectorAResult;
/**
 * VECTOR B: Menu / Product / Service Pricing Intelligence
 */
export declare function auditVectorBMenuPricing(intake: IntakeRequirements, competitors: CompetitorProfile[]): VectorBResult;
/**
 * VECTOR C: Multimodal Visual & Infrastructure Audit
 */
export declare function auditVectorCMultimodal(intake: IntakeRequirements): VectorCResult;
/**
 * VECTOR D: Voice of Customer / Review Intelligence
 */
export declare function auditVectorDVoiceOfCustomer(intake: IntakeRequirements): VectorDResult;
/**
 * VECTOR E: Market Demand & Local Economic Intelligence
 */
export declare function auditVectorEMarketDemand(intake: IntakeRequirements): VectorEResult;
/**
 * VECTOR F: Digital Demand & Customer Acquisition
 */
export declare function auditVectorFDigitalDemand(intake: IntakeRequirements, competitors: CompetitorProfile[]): VectorFResult;
/**
 * Triangulate Findings into Evidence-Backed Market Gaps / White Space
 */
export declare function analyzeMarketGaps(intake: IntakeRequirements, competitors: CompetitorProfile[], pricing: VectorBResult, voc: VectorDResult): MarketGap[];

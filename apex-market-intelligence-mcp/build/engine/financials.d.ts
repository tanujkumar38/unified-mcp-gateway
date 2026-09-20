import { IntakeRequirements, FinancialModelResult, FeasibilityScorecardResult, RiskMatrixItem, ExecutionRoadmapResult, StrategicRecommendation } from "../types.js";
/**
 * Builds the comprehensive Location-Specific Financial Model
 */
export declare function buildFinancialModel(intake: IntakeRequirements): FinancialModelResult;
/**
 * Builds the Weighted 100-Point Feasibility Scorecard
 */
export declare function buildFeasibilityScorecard(intake: IntakeRequirements, financials: FinancialModelResult): FeasibilityScorecardResult;
/**
 * Builds the 12-Factor Risk Matrix
 */
export declare function buildRiskMatrix(): RiskMatrixItem[];
/**
 * Builds the 30-60-90 Day Execution Roadmap
 */
export declare function buildExecutionRoadmap(): ExecutionRoadmapResult;
/**
 * Compiles Strategic Evidence-Backed Recommendations
 */
export declare function buildStrategicRecommendations(): StrategicRecommendation[];

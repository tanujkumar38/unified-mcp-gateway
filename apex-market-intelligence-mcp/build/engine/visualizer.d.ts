import { CompetitorProfile, VectorDResult, FinancialModelResult, RiskMatrixItem, TreeOfThoughtsResult } from "../types.js";
/**
 * Visualizer Engine generating standalone, vector-sharp SVG charts for Executive PDF Reports
 */
export declare function generateRatingVsReviewsSvg(competitors: CompetitorProfile[]): string;
export declare function generateCustomerComplaintSvg(voc: VectorDResult): string;
export declare function generateRevenueScenarioSvg(financials: FinancialModelResult): string;
export declare function generateSensitivityAnalysisSvg(financials: FinancialModelResult): string;
export declare function generateRiskHeatmapSvg(risks: RiskMatrixItem[]): string;
export declare function generateTreeOfThoughtsSvg(tot: TreeOfThoughtsResult): string;

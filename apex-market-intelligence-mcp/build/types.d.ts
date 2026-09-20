import { z } from "zod";
export declare const IntakeRequirementsSchema: z.ZodObject<{
    targetIndustry: z.ZodString;
    exactMicroLocation: z.ZodString;
    researchRadiusKm: z.ZodDefault<z.ZodNumber>;
    primaryObjective: z.ZodString;
    targetCustomerSegment: z.ZodString;
    knownCompetitors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    currency: z.ZodDefault<z.ZodString>;
    investmentBudget: z.ZodOptional<z.ZodNumber>;
    storeSizeSqft: z.ZodOptional<z.ZodNumber>;
    preferredPropertyType: z.ZodOptional<z.ZodString>;
    isExistingBusiness: z.ZodDefault<z.ZodBoolean>;
    existingMonthlyRevenue: z.ZodOptional<z.ZodNumber>;
    existingAov: z.ZodOptional<z.ZodNumber>;
    desiredPositioning: z.ZodDefault<z.ZodEnum<["budget", "mass", "premium", "luxury"]>>;
    targetOpeningTimelineMonths: z.ZodOptional<z.ZodNumber>;
    operationalConstraints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    targetIndustry: string;
    exactMicroLocation: string;
    researchRadiusKm: number;
    primaryObjective: string;
    targetCustomerSegment: string;
    currency: string;
    isExistingBusiness: boolean;
    desiredPositioning: "budget" | "mass" | "premium" | "luxury";
    knownCompetitors?: string[] | undefined;
    investmentBudget?: number | undefined;
    storeSizeSqft?: number | undefined;
    preferredPropertyType?: string | undefined;
    existingMonthlyRevenue?: number | undefined;
    existingAov?: number | undefined;
    targetOpeningTimelineMonths?: number | undefined;
    operationalConstraints?: string[] | undefined;
}, {
    targetIndustry: string;
    exactMicroLocation: string;
    primaryObjective: string;
    targetCustomerSegment: string;
    researchRadiusKm?: number | undefined;
    knownCompetitors?: string[] | undefined;
    currency?: string | undefined;
    investmentBudget?: number | undefined;
    storeSizeSqft?: number | undefined;
    preferredPropertyType?: string | undefined;
    isExistingBusiness?: boolean | undefined;
    existingMonthlyRevenue?: number | undefined;
    existingAov?: number | undefined;
    desiredPositioning?: "budget" | "mass" | "premium" | "luxury" | undefined;
    targetOpeningTimelineMonths?: number | undefined;
    operationalConstraints?: string[] | undefined;
}>;
export type IntakeRequirements = z.infer<typeof IntakeRequirementsSchema>;
export interface CompetitorProfile {
    name: string;
    type: "direct" | "indirect" | "benchmark";
    address: string;
    distanceKm: number;
    rating: number;
    reviewCount: number;
    reviewRecency: string;
    priceTier: "$" | "$$" | "$$$" | "$$$$";
    operatingHours: string;
    peakHours: string;
    website: string;
    socialPresence: string;
    deliveryPresence: string[];
    menuHighlights: string[];
    amenities: string[];
    positioning: string;
    keyDifferentiators: string[];
    observableWeaknesses: string[];
    reliabilityTier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";
}
export interface OnlineVsGroundMatrix {
    accurateOnline: string[];
    estimatedOnline: string[];
    unverifiableOnline: string[];
    confidenceImpact: string;
    fieldResearchChecklist: string[];
}
export interface VectorAResult {
    competitors: CompetitorProfile[];
    directCompetitorCount: number;
    indirectCompetitorCount: number;
    benchmarkCount: number;
    averageRating: number;
    medianReviewCount: number;
    spatialSaturationScore: number;
    onlineVsGround: OnlineVsGroundMatrix;
}
export interface PriceBand {
    band: string;
    range: [number, number];
    competitorCount: number;
    saturation: "low" | "moderate" | "overcrowded";
}
export interface VectorBResult {
    entryLevelPrice: number;
    coreMarketPrice: number;
    premiumPrice: number;
    medianPrice: number;
    priceRange: {
        min: number;
        max: number;
    };
    priceBands: PriceBand[];
    priceGaps: string[];
    estimatedGrossMarginProxy: {
        cogsPct: number;
        grossMarginPct: number;
        assumptions: string;
    };
    recommendedEntryPrice: number;
    recommendedCorePrice: number;
    recommendedPremiumPrice: number;
}
export type ObservationStatus = "Observed" | "Inferred" | "Unknown";
export interface InfrastructureAuditItem {
    category: string;
    attribute: string;
    status: ObservationStatus;
    evidence: string;
    commercialImpact: string;
}
export interface VectorCResult {
    items: InfrastructureAuditItem[];
    seatingCapacityEstimate: {
        min: number;
        max: number;
        basis: string;
    };
    workspaceSuitabilityScore: number;
    parkingConvenienceScore: number;
    visualBrandMaturityScore: number;
    criticalInfrastructureGaps: string[];
}
export interface ReviewIssueCategory {
    issue: string;
    frequencyPct: number;
    severity: "High" | "Medium" | "Low";
    sampleQuotes: string[];
}
export interface VectorDResult {
    totalReviewsSampled: number;
    timeframe: string;
    productIssues: ReviewIssueCategory[];
    serviceIssues: ReviewIssueCategory[];
    pricingIssues: ReviewIssueCategory[];
    infrastructureIssues: ReviewIssueCategory[];
    experienceIssues: ReviewIssueCategory[];
    positiveDrivers: {
        driver: string;
        frequencyPct: number;
        whyValued: string;
    }[];
    crossMarketPainPoints: string[];
    competitorSpecificWeaknesses: {
        competitor: string;
        mainVulnerability: string;
    }[];
}
export interface VectorEResult {
    catchmentPopulationEstimate: number;
    daytimeWorkingPopulationProxy: number;
    studentPopulationProxy: number;
    residentialConcentrationPct: number;
    commercialOfficeConcentrationPct: number;
    demandGenerators: string[];
    demandSuppressors: string[];
    seasonalDemandPatterns: string[];
    disposableIncomeProxy: "Above Average" | "High" | "Affluent" | "Moderate" | "Value-Driven";
    catchmentSummary: string;
}
export interface VectorFResult {
    localSearchDemandTier: "Very High" | "High" | "Moderate" | "Emerging";
    topSearchKeywords: string[];
    googleMapsRankingDifficulty: "High" | "Moderate" | "Low";
    competitorDigitalMaturity: {
        name: string;
        scoreOutOf10: number;
        instagramEngagement: string;
        localSeoRank: string;
    }[];
    customerAcquisitionGaps: string[];
    recommendedDigitalStrategy: string[];
}
export interface MarketGap {
    opportunity: string;
    evidence: string;
    targetCustomer: string;
    competitiveSaturation: "None" | "Low" | "Moderate" | "High";
    monetization: string;
    difficulty: "Low" | "Medium" | "High";
    confidence: "High" | "Medium" | "Low";
}
export interface CapexLineItem {
    category: string;
    low: number;
    base: number;
    high: number;
    basis: string;
    confidence: "High" | "Medium" | "Low";
}
export interface OpexFixedItem {
    item: string;
    monthlyCost: number;
    basis: string;
}
export interface OpexVariableItem {
    item: string;
    costRate: string;
    monthlyEstimatedCost: number;
    basis: string;
}
export interface FinancialModelResult {
    currency: string;
    capexItems: CapexLineItem[];
    totalCapexLow: number;
    totalCapexBase: number;
    totalCapexHigh: number;
    opexFixed: OpexFixedItem[];
    opexVariable: OpexVariableItem[];
    totalFixedMonthlyOpex: number;
    totalVariableMonthlyOpexBase: number;
    totalMonthlyOpexBase: number;
    unitEconomics: {
        aov: number;
        customersPerDayBase: number;
        monthlyRevenueBase: number;
        cogsPct: number;
        grossMarginPct: number;
        grossProfitMonthlyBase: number;
        contributionMarginPct: number;
        breakEvenMonthlyRevenue: number;
        breakEvenCustomersPerDay: number;
        estimatedPaybackMonthsBase: number;
    };
    scenarios: {
        conservative: ScenarioMetrics;
        baseCase: ScenarioMetrics;
        upside: ScenarioMetrics;
    };
    sensitivityAnalysis: {
        variable: string;
        variation: string;
        impactOnMonthlyProfitPct: number;
        profitImpactAmount: number;
        impactRank: number;
    }[];
}
export interface ScenarioMetrics {
    scenarioName: "Conservative" | "Base Case" | "Upside";
    capacityUtilizationPct: number;
    customersPerDay: number;
    aov: number;
    monthlyRevenue: number;
    cogsAmount: number;
    grossProfit: number;
    fixedCosts: number;
    netOperatingProfit: number;
    operatingMarginPct: number;
    breakEvenCustomersPerDay: number;
    estimatedPaybackMonths: number;
}
export interface FeasibilityDimension {
    dimension: string;
    weightPct: number;
    scoreOutOf100: number;
    weightedScore: number;
    evidence: string;
    reasoning: string;
    confidence: "High" | "Medium" | "Low";
}
export interface FeasibilityScorecardResult {
    totalWeightedScore: number;
    verdict: "Highly Feasible" | "Conditionally Feasible" | "High Commercial Risk";
    dimensions: FeasibilityDimension[];
    criticalUnknowns: string[];
}
export interface RiskMatrixItem {
    category: string;
    risk: string;
    probability: "High" | "Medium" | "Low";
    impact: "High" | "Medium" | "Low";
    earlyWarningSignal: string;
    mitigation: string;
}
export interface RoadmapAction {
    objective: string;
    action: string;
    owner: string;
    priority: "Critical" | "High" | "Medium";
    expectedOutcome: string;
    kpi: string;
    deadline: string;
}
export interface ExecutionRoadmapResult {
    days1To30: RoadmapAction[];
    days31To60: RoadmapAction[];
    days61To90: RoadmapAction[];
}
export interface StrategicRecommendation {
    title: string;
    what: string;
    why: string;
    how: string;
    costEstimate: string;
    expectedImpact: string;
    confidence: "High" | "Medium" | "Low";
}
export interface SourceRegisterItem {
    sourceName: string;
    sourceType: string;
    urlOrRef: string;
    dataUsed: string;
    dateAccessed: string;
    reliabilityTier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";
    triangulationStatus: string;
}
export interface AssumptionRegisterItem {
    assumption: string;
    value: string;
    whyUsed: string;
    sourceOrBasis: string;
    confidence: "High" | "Medium" | "Low";
}
export interface DataQualityReport {
    overallConfidence: "High" | "Medium" | "Low";
    dataCoverageSummary: string;
    missingDataItems: string[];
    contradictionsResolved: string[];
    onlineLimitations: string[];
    recommendedGroundValidation: string[];
}
export interface ThoughtBranch {
    id: string;
    archetypeName: string;
    strategicPremise: string;
    targetCustomerFocus: string;
    spaceAndCapexProfile: {
        sqft: number;
        estimatedCapex: number;
        capexIntensity: "Low" | "Moderate" | "High" | "Very High";
    };
    unitEconomicsProfile: {
        targetAov: number;
        dailyCoversNeeded: number;
        marginProfile: string;
        paybackMonths: number;
    };
    scores: {
        capitalEfficiency: number;
        competitiveMoat: number;
        operationalFragility: number;
        downsideResilience: number;
        marketPersonaResonance: number;
        compositeScore: number;
    };
    keyAdvantages: string[];
    fatalVulnerabilities: string[];
    pruned: boolean;
    pruningRationale?: string;
}
export interface TreeOfThoughtsResult {
    evaluationDimensions: {
        dimension: string;
        weightPct: number;
    }[];
    branches: ThoughtBranch[];
    selectedBranchId: string;
    selectedBranchName: string;
    deliberationSummary: string;
    paretoTradeoffAnalysis: string;
    synthesizedExecutionThesis: string;
}
export interface DevilsAdvocateAudit {
    hostileIncumbentAttacks: {
        incumbentType: string;
        attackVector: string;
        vulnerabilityExposed: string;
        counterMeasure: string;
    }[];
    criticalFailureModes: {
        failureScenario: string;
        triggerCondition: string;
        lethality: "Catastrophic" | "Severe" | "Manageable";
        survivalPlaybook: string;
    }[];
    cognitiveBiasChecklist: {
        bias: "Optimism Bias" | "Sunk Cost Fallacy" | "Survivorship Bias" | "Clustering Illusion";
        manifestationRisk: string;
        realityCheck: string;
    }[];
    killSwitchCriteria: string[];
}
export interface SecondOrderEffect {
    primaryDecision: string;
    firstOrderDirectImpact: string;
    secondOrderSystemicImpact: string;
    thirdOrderLongTermOutcome: string;
    feedbackLoopType: "Reinforcing (Virtuous/Vicious)" | "Balancing (Self-Stabilizing)";
    managerialGuardrail: string;
}
export interface BayesianFeasibilityResult {
    priorIndustrySurvivalRatePct: number;
    evidenceLikelihoodUpdates: {
        vector: string;
        observationSummary: string;
        bayesFactor: number;
        direction: "Positive Evidence" | "Neutral" | "Risk Factor";
    }[];
    posteriorSurvivalProbabilityPct: number;
    credibleInterval95Pct: [number, number];
    probabilisticVerdict: string;
}
export interface MasterMarketAuditResult {
    intake: IntakeRequirements;
    timestamp: string;
    geospatial: VectorAResult;
    pricing: VectorBResult;
    infrastructure: VectorCResult;
    voiceOfCustomer: VectorDResult;
    marketDemand: VectorEResult;
    digitalDemand: VectorFResult;
    marketGaps: MarketGap[];
    financials: FinancialModelResult;
    scorecard: FeasibilityScorecardResult;
    risks: RiskMatrixItem[];
    roadmap: ExecutionRoadmapResult;
    recommendations: StrategicRecommendation[];
    sourceRegister: SourceRegisterItem[];
    assumptionRegister: AssumptionRegisterItem[];
    dataQuality: DataQualityReport;
    treeOfThoughts: TreeOfThoughtsResult;
    devilsAdvocate: DevilsAdvocateAudit;
    secondOrderEffects: SecondOrderEffect[];
    bayesianFeasibility: BayesianFeasibilityResult;
}

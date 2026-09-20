import { z } from "zod";

// --- Step 0 Intake Schemas ---
export const IntakeRequirementsSchema = z.object({
  targetIndustry: z.string().describe("Target Industry / Niche (e.g. Specialty Coffee Café, Premium Gym, Unisex Salon)"),
  exactMicroLocation: z.string().describe("Exact Micro-Location & City (e.g. Malviya Nagar, Jaipur)"),
  researchRadiusKm: z.number().default(3).describe("Research Radius in km (default 3km, recommended 3-5km)"),
  primaryObjective: z.string().describe("Primary Business Objective (e.g. New business launch, Outpost feasibility, Pricing optimization)"),
  targetCustomerSegment: z.string().describe("Target Customer Segment (e.g. Young professionals, College students, Affluent families)"),
  knownCompetitors: z.array(z.string()).optional().describe("Known Competitors within or adjacent to the catchment area"),
  currency: z.string().default("INR").describe("Financial currency symbol/code (e.g. INR, USD, EUR, GBP)"),
  investmentBudget: z.number().optional().describe("Approximate total investment budget"),
  storeSizeSqft: z.number().optional().describe("Approximate store/space size in square feet"),
  preferredPropertyType: z.string().optional().describe("High-street, Shopping Mall, Tech Park, Residential Main Road, etc."),
  isExistingBusiness: z.boolean().default(false).describe("Whether this is an existing operational business or new launch"),
  existingMonthlyRevenue: z.number().optional().describe("Existing monthly revenue if applicable"),
  existingAov: z.number().optional().describe("Existing Average Order Value (AOV) if available"),
  desiredPositioning: z.enum(["budget", "mass", "premium", "luxury"]).default("premium").describe("Desired market positioning"),
  targetOpeningTimelineMonths: z.number().optional().describe("Desired opening timeline in months"),
  operationalConstraints: z.array(z.string()).optional().describe("Key operational or physical constraints")
});

export type IntakeRequirements = z.infer<typeof IntakeRequirementsSchema>;

// --- Vector A: Geospatial & Competitor ---
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
  spatialSaturationScore: number; // 0 - 100
  onlineVsGround: OnlineVsGroundMatrix;
}

// --- Vector B: Menu / Product / Pricing ---
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
  priceRange: { min: number; max: number };
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

// --- Vector C: Multimodal Infrastructure ---
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
  seatingCapacityEstimate: { min: number; max: number; basis: string };
  workspaceSuitabilityScore: number; // 0 - 100
  parkingConvenienceScore: number; // 0 - 100
  visualBrandMaturityScore: number; // 0 - 100
  criticalInfrastructureGaps: string[];
}

// --- Vector D: Voice of Customer / Reviews ---
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
  positiveDrivers: { driver: string; frequencyPct: number; whyValued: string }[];
  crossMarketPainPoints: string[];
  competitorSpecificWeaknesses: { competitor: string; mainVulnerability: string }[];
}

// --- Vector E: Market Demand & Local Demographics ---
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

// --- Vector F: Digital Demand & Acquisition ---
export interface VectorFResult {
  localSearchDemandTier: "Very High" | "High" | "Moderate" | "Emerging";
  topSearchKeywords: string[];
  googleMapsRankingDifficulty: "High" | "Moderate" | "Low";
  competitorDigitalMaturity: { name: string; scoreOutOf10: number; instagramEngagement: string; localSeoRank: string }[];
  customerAcquisitionGaps: string[];
  recommendedDigitalStrategy: string[];
}

// --- Market Gap / White Space ---
export interface MarketGap {
  opportunity: string;
  evidence: string;
  targetCustomer: string;
  competitiveSaturation: "None" | "Low" | "Moderate" | "High";
  monetization: string;
  difficulty: "Low" | "Medium" | "High";
  confidence: "High" | "Medium" | "Low";
}

// --- Financial Models ---
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

// --- Feasibility Scorecard & Risk Matrix ---
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

// --- Roadmap & Recommendations ---
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

// --- Source & Assumption Registers ---
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

// --- Tree of Thoughts (ToT) & Cognitive Layer ---
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
    operationalFragility: number; // Higher is more resilient
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
  evaluationDimensions: { dimension: string; weightPct: number }[];
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

// --- 1. Critical Thinking Audit ---
export interface SocraticInterrogation {
  underlyingPremise: string;
  socraticChallenge: string;
  empiricalEvidenceTest: string;
  robustnessVerdict: "Validated" | "Fragile" | "Refuted";
}

export interface LogicalFallacyAlert {
  fallacyName: string;
  observedPattern: string;
  correctionAction: string;
}

export interface CognitiveBiasAssessment {
  bias: string;
  riskManifestation: string;
  counterMeasure: string;
}

export interface CriticalThinkingAudit {
  socraticInterrogations: SocraticInterrogation[];
  logicalFallaciesIdentified: LogicalFallacyAlert[];
  cognitiveBiasesMitigated: CognitiveBiasAssessment[];
  epistemicConfidenceScore: number; // 0 - 100
  criticalThinkingSynthesis: string;
}

// --- 2. First-Principles Deconstruction ---
export interface PhysicalEconomicAxiom {
  resource: string;
  physicalInput: string;
  unitCostAxiom: string;
  benchmarkAnalogyCost: string;
  firstPrinciplesArbitrage: string;
}

export interface FirstPrinciplesDeconstruction {
  foundationalTruths: string[];
  physicalEconomicAxioms: PhysicalEconomicAxiom[];
  zeroBasedCostReconstruction: {
    theoreticalFloorCogsPct: number;
    laborEfficiencyHoursPerCover: number;
    spatialYieldMonthlyPerSqft: number;
  };
  analogyVsFirstPrinciplesSynthesis: string;
}

// --- 3. Inversion & Pre-Mortem Thinking ---
export interface PreMortemAutopsyItem {
  fatalMechanism: string;
  rootCauseTrajectory: string;
  preventativeInoculation: string;
}

export interface InversionPreMortem {
  prospectiveHindsightHorizon: string; // "24 Months Post-Launch"
  catastrophicFailurePremise: string;
  autopsyForensicFindings: PreMortemAutopsyItem[];
  antiGoalsRegister: string[];
  mandatoryKillSwitches: {
    metric: string;
    threshold: string;
    enforcementAction: string;
  }[];
  inversionSynthesis: string;
}

// --- 4. Lateral & Divergent Thinking ---
export interface ProvocationOperation {
  dogmaChallenged: string;
  provocativeHypothesis: string;
  lateralCommercialModel: string;
  viabilityTier: "Breakthrough" | "High Value Niche" | "Speculative";
}

export interface LateralThinkingExploration {
  provocations: ProvocationOperation[];
  crossIndustryTransfers: {
    donorIndustry: string;
    transferredMechanism: string;
    localApplication: string;
  }[];
  asymmetricRevenueVectors: string[];
  lateralThinkingSynthesis: string;
}

// --- 5. Strategic Game Theory War Room ---
export interface CompetitorReaction {
  competitorGroup: string;
  likelyMove: string;
  payoffToCompetitor: string;
  impactOnApex: string;
  dominantCounterStrategy: string;
}

export interface GameTheoreticWarRoom {
  gameFormulation: string;
  competitorReactions: CompetitorReaction[];
  nashEquilibriumPosture: string;
  minimaxDefensiveStrategy: string;
  moatAndLockinMechanisms: string[];
}

// --- 6. Dialectical Thinking ---
export interface DialecticalTension {
  thesis: string;
  antithesis: string;
  underlyingConflict: string;
  higherOrderSynthesis: string;
}

export interface DialecticalSynthesis {
  coreTensions: DialecticalTension[];
  overarchingStrategicSynthesis: string;
}

// --- 7. Counterfactual Simulation ---
export interface CounterfactualScenario {
  scenarioId: string;
  name: string;
  counterfactualShock: string;
  projectedProfitVariancePct: number;
  businessSurvivalProbabilityPct: number;
  resiliencePlaybook: string;
}

export interface CounterfactualSimulation {
  baselineReference: string;
  branches: CounterfactualScenario[];
  systemicAntifragilityScore: number; // 0 - 100
  counterfactualSynthesis: string;
}

// --- Omni-Cognitive Architecture Container (All 10 Paradigms) ---
export interface OmniCognitiveAuditResult {
  criticalThinking: CriticalThinkingAudit;
  firstPrinciples: FirstPrinciplesDeconstruction;
  inversionPreMortem: InversionPreMortem;
  lateralThinking: LateralThinkingExploration;
  gameTheory: GameTheoreticWarRoom;
  dialectics: DialecticalSynthesis;
  counterfactuals: CounterfactualSimulation;
  secondOrderDynamics: SecondOrderEffect[];
  treeOfThoughts: TreeOfThoughtsResult;
  bayesianFeasibility: BayesianFeasibilityResult;
  omniCognitiveSummary: string;
}

// --- Master Full Audit Result ---
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
  omniCognitive: OmniCognitiveAuditResult;
}



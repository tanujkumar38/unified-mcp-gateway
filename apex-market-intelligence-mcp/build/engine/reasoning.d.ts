import { IntakeRequirements, VectorAResult, VectorBResult, VectorDResult, VectorEResult, ThoughtBranch, TreeOfThoughtsResult, DevilsAdvocateAudit, SecondOrderEffect, BayesianFeasibilityResult, CriticalThinkingAudit, FirstPrinciplesDeconstruction, InversionPreMortem, LateralThinkingExploration, GameTheoreticWarRoom, DialecticalSynthesis, CounterfactualSimulation, OmniCognitiveAuditResult, MarketGap } from "../types.js";
/**
 * TREE OF THOUGHTS (ToT) REASONING ENGINE
 * Explores multiple competing business hypotheses, scores branches, prunes sub-optimal paths,
 * and synthesizes the Pareto-optimal strategy.
 */
export declare function executeTreeOfThoughts(intake: IntakeRequirements, geo: VectorAResult, pricing: VectorBResult, voc: VectorDResult, demand: VectorEResult): TreeOfThoughtsResult;
/**
 * ADVERSARIAL RED-TEAM / DEVIL'S ADVOCATE AUDIT
 * Actively stress-tests the business model to identify fatal failure modes and blind spots.
 */
export declare function conductDevilsAdvocateStressTest(intake: IntakeRequirements, selectedBranch: ThoughtBranch, voc: VectorDResult, geo: VectorAResult): DevilsAdvocateAudit;
/**
 * SECOND-ORDER & THIRD-ORDER SYSTEM DYNAMICS SIMULATION
 * Models unintended systemic consequences and feedback delays of key operational decisions.
 */
export declare function simulateSecondOrderDynamics(selectedBranch: ThoughtBranch): SecondOrderEffect[];
/**
 * BAYESIAN EVIDENCE UPDATING ENGINE
 * Updates prior industry baseline survival rates with empirical local evidence vectors.
 */
export declare function calculateBayesianPosterior(intake: IntakeRequirements, geo: VectorAResult, voc: VectorDResult, demand: VectorEResult): BayesianFeasibilityResult;
/**
 * 1. CRITICAL THINKING & SOCRATIC AUDITING ENGINE
 * Interrogates foundational business premises, exposes logical fallacies,
 * mitigates cognitive biases, and assigns epistemic credibility ratings.
 */
export declare function conductCriticalThinkingAudit(intake: IntakeRequirements, geo: VectorAResult, voc: VectorDResult, financials?: any): CriticalThinkingAudit;
/**
 * 2. FIRST-PRINCIPLES DECONSTRUCTION ENGINE
 * Breaks business down to fundamental thermodynamic, spatial, and economic truths.
 */
export declare function deconstructFirstPrinciples(intake: IntakeRequirements, pricing: VectorBResult, financials?: any): FirstPrinciplesDeconstruction;
/**
 * 3. INVERSION & PRE-MORTEM THINKING ENGINE
 * Charlie Munger style: "Invert, always invert." Autopsies failure scenarios 24 months forward.
 */
export declare function conductInversionPreMortem(intake: IntakeRequirements, tot?: TreeOfThoughtsResult, financials?: any): InversionPreMortem;
/**
 * 4. LATERAL & DIVERGENT THINKING ENGINE
 * Explores unconventional business models, cross-industry analogies, and provocative operations (PO).
 */
export declare function exploreLateralThinking(intake: IntakeRequirements, marketGaps: MarketGap[]): LateralThinkingExploration;
/**
 * 5. STRATEGIC GAME THEORY WAR ROOM
 * Models competitor reaction functions, 2x2 payoff matrices, and Nash equilibrium defensibility.
 */
export declare function simulateGameTheoryWarRoom(intake: IntakeRequirements, geo: VectorAResult, pricing: VectorBResult): GameTheoreticWarRoom;
/**
 * 6. DIALECTICAL SYNTHESIS ENGINE
 * Resolves fundamental commercial polarities through Hegelian Thesis-Antithesis-Synthesis.
 */
export declare function synthesizeDialectics(intake: IntakeRequirements, tot?: TreeOfThoughtsResult): DialecticalSynthesis;
/**
 * 7. COUNTERFACTUAL SIMULATION ENGINE
 * Evaluates alternate branch realities, macro shocks, and systemic antifragility.
 */
export declare function simulateCounterfactuals(intake: IntakeRequirements, financials?: any): CounterfactualSimulation;
/**
 * 10. OMNI-COGNITIVE MASTER AUDIT ORCHESTRATOR
 * Integrates all 10 thinking paradigms into a unified, evidence-driven cognitive suite.
 */
export declare function executeOmniCognitiveAudit(intake: IntakeRequirements, geo: VectorAResult, pricing: VectorBResult, voc: VectorDResult, demand: VectorEResult, marketGaps: MarketGap[], financials?: any): OmniCognitiveAuditResult;

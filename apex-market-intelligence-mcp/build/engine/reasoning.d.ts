import { IntakeRequirements, VectorAResult, VectorBResult, VectorDResult, VectorEResult, ThoughtBranch, TreeOfThoughtsResult, DevilsAdvocateAudit, SecondOrderEffect, BayesianFeasibilityResult } from "../types.js";
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

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
//# sourceMappingURL=types.js.map
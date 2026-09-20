import { MasterMarketAuditResult } from "../types.js";
/**
 * DELIVERABLE 1: Master Markdown Report Generator
 */
export declare function generateMasterMarkdownReport(audit: MasterMarketAuditResult): string;
/**
 * Compiles the Master HTML Document for Publication-Grade PDF Rendering
 */
export declare function generateMasterHtmlDocument(audit: MasterMarketAuditResult): string;
/**
 * DELIVERABLE 2: Publication-Quality Executive PDF Generator with Headless Chrome
 */
export declare function renderExecutivePdf(audit: MasterMarketAuditResult, outputPdfPath: string): Promise<{
    success: boolean;
    outputPath: string;
    sizeBytes: number;
    pageCount: number;
    error?: string;
}>;

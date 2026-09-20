/**
 * Visualizer Engine generating standalone, vector-sharp SVG charts for Executive PDF Reports
 */
export function generateRatingVsReviewsSvg(competitors) {
    const width = 640;
    const height = 300;
    const padLeft = 60;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const minRating = 3.8;
    const maxRating = 5.0;
    const maxReviews = 6000;
    const getX = (r) => padLeft + ((r - minRating) / (maxRating - minRating)) * chartW;
    const getY = (c) => padTop + chartH - (c / maxReviews) * chartH;
    const gridLines = [4.0, 4.2, 4.4, 4.6, 4.8, 5.0].map(r => {
        const x = getX(r);
        return `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + chartH}" stroke="#e2e8f0" stroke-dasharray="3,3" />
            <text x="${x}" y="${padTop + chartH + 18}" fill="#64748b" font-size="11" text-anchor="middle" font-family="system-ui">${r.toFixed(1)}★</text>`;
    }).join("\n");
    const yLines = [0, 1500, 3000, 4500, 6000].map(cnt => {
        const y = getY(cnt);
        return `<line x1="${padLeft}" y1="${y}" x2="${padLeft + chartW}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3" />
            <text x="${padLeft - 10}" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end" font-family="system-ui">${cnt.toLocaleString()}</text>`;
    }).join("\n");
    const dots = competitors.map(c => {
        const cx = getX(c.rating);
        const cy = getY(c.reviewCount);
        const color = c.type === "benchmark" ? "#2563eb" : c.type === "direct" ? "#059669" : "#d97706";
        const radius = 8;
        return `
      <g class="bubble" transform="translate(0,0)">
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" fill-opacity="0.85" stroke="#ffffff" stroke-width="2" />
        <text x="${cx + 12}" y="${cy + 4}" fill="#1e293b" font-size="10" font-weight="600" font-family="system-ui">${c.name} (${c.rating}★)</text>
      </g>
    `;
    }).join("\n");
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <!-- Grid & Axes -->
      ${gridLines}
      ${yLines}
      <line x1="${padLeft}" y1="${padTop + chartH}" x2="${padLeft + chartW}" y2="${padTop + chartH}" stroke="#94a3b8" stroke-width="1.5" />
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + chartH}" stroke="#94a3b8" stroke-width="1.5" />
      
      <!-- Axis Labels -->
      <text x="${padLeft + chartW / 2}" y="${height - 8}" fill="#475569" font-size="11" font-weight="600" text-anchor="middle" font-family="system-ui">Google Rating (Stars)</text>
      <text x="18" y="${padTop + chartH / 2}" fill="#475569" font-size="11" font-weight="600" text-anchor="middle" transform="rotate(-90, 18, ${padTop + chartH / 2})" font-family="system-ui">Total Public Reviews</text>
      
      <!-- Data Points -->
      ${dots}
      
      <!-- Legend -->
      <g transform="translate(${padLeft + 15}, ${padTop + 15})">
        <circle cx="0" cy="0" r="5" fill="#059669" />
        <text x="10" y="3.5" fill="#334155" font-size="10" font-family="system-ui">Direct Competitor</text>
        <circle cx="120" cy="0" r="5" fill="#2563eb" />
        <text x="130" y="3.5" fill="#334155" font-size="10" font-family="system-ui">Benchmark</text>
        <circle cx="210" cy="0" r="5" fill="#d97706" />
        <text x="220" y="3.5" fill="#334155" font-size="10" font-family="system-ui">Indirect</text>
      </g>
    </svg>
  `;
}
export function generateCustomerComplaintSvg(voc) {
    const width = 640;
    const height = 240;
    const padLeft = 210;
    const padRight = 60;
    const padTop = 30;
    const barHeight = 22;
    const gap = 12;
    const topComplaints = [
        { label: "Parking Scarcity & Towing", pct: 34.2, color: "#dc2626" },
        { label: "Weekend Wait Times (30m+)", pct: 28.3, color: "#ea580c" },
        { label: "Table Camping / No Seats", pct: 26.1, color: "#d97706" },
        { label: "Small Portion Optics", pct: 22.8, color: "#f59e0b" },
        { label: "Deafening Hall Echo / Noise", pct: 21.7, color: "#ca8a04" },
        { label: "Inconsistent Coffee Temp", pct: 18.5, color: "#65a30d" }
    ];
    const maxPct = 40;
    const maxW = width - padLeft - padRight;
    const bars = topComplaints.map((c, i) => {
        const y = padTop + i * (barHeight + gap);
        const barW = Math.round((c.pct / maxPct) * maxW);
        return `
      <text x="${padLeft - 12}" y="${y + 16}" fill="#334155" font-size="11" font-weight="600" text-anchor="end" font-family="system-ui">${c.label}</text>
      <rect x="${padLeft}" y="${y}" width="${barW}" height="${barHeight}" rx="4" fill="${c.color}" />
      <text x="${padLeft + barW + 8}" y="${y + 16}" fill="#1e293b" font-size="11" font-weight="700" font-family="system-ui">${c.pct.toFixed(1)}%</text>
    `;
    }).join("\n");
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <text x="${padLeft}" y="18" fill="#64748b" font-size="10" font-weight="600" font-family="system-ui">Complaint Mention Frequency in Catchment Reviews (%)</text>
      ${bars}
    </svg>
  `;
}
export function generateRevenueScenarioSvg(financials) {
    const width = 640;
    const height = 260;
    const padLeft = 80;
    const padRight = 40;
    const padTop = 40;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const scenarios = [
        { label: "Conservative (48%)", rev: financials.scenarios.conservative.monthlyRevenue, profit: financials.scenarios.conservative.netOperatingProfit },
        { label: "Base Case (70%)", rev: financials.scenarios.baseCase.monthlyRevenue, profit: financials.scenarios.baseCase.netOperatingProfit },
        { label: "Upside Case (88%)", rev: financials.scenarios.upside.monthlyRevenue, profit: financials.scenarios.upside.netOperatingProfit }
    ];
    const maxVal = 1800000;
    const getH = (val) => Math.max(0, (val / maxVal) * chartH);
    const groupWidth = chartW / 3;
    const barW = 38;
    const groups = scenarios.map((s, idx) => {
        const groupX = padLeft + idx * groupWidth;
        const revH = getH(s.rev);
        const profitH = getH(s.profit);
        const revY = padTop + chartH - revH;
        const profitY = padTop + chartH - profitH;
        return `
      <!-- Revenue Bar -->
      <rect x="${groupX + 20}" y="${revY}" width="${barW}" height="${revH}" rx="4" fill="#3b82f6" />
      <text x="${groupX + 20 + barW / 2}" y="${revY - 6}" fill="#1e3a8a" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui">₹${(s.rev / 100000).toFixed(1)}L</text>
      
      <!-- Operating Profit Bar -->
      <rect x="${groupX + 20 + barW + 8}" y="${profitY}" width="${barW}" height="${profitH}" rx="4" fill="#10b981" />
      <text x="${groupX + 20 + barW + 8 + barW / 2}" y="${profitY - 6}" fill="#065f46" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui">₹${(s.profit / 100000).toFixed(1)}L</text>
      
      <!-- Group Label -->
      <text x="${groupX + groupWidth / 2}" y="${padTop + chartH + 22}" fill="#334155" font-size="11" font-weight="600" text-anchor="middle" font-family="system-ui">${s.label}</text>
    `;
    }).join("\n");
    const yLabels = [0, 500000, 1000000, 1500000].map(val => {
        const y = padTop + chartH - getH(val);
        return `
      <line x1="${padLeft}" y1="${y}" x2="${padLeft + chartW}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3" />
      <text x="${padLeft - 10}" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end" font-family="system-ui">₹${(val / 100000).toFixed(0)}L</text>
    `;
    }).join("\n");
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <!-- Grid -->
      ${yLabels}
      <line x1="${padLeft}" y1="${padTop + chartH}" x2="${padLeft + chartW}" y2="${padTop + chartH}" stroke="#94a3b8" stroke-width="1.5" />
      
      <!-- Legend -->
      <g transform="translate(${padLeft + 10}, 18)">
        <rect x="0" y="0" width="12" height="12" rx="2" fill="#3b82f6" />
        <text x="18" y="10" fill="#334155" font-size="11" font-family="system-ui">Monthly Gross Revenue</text>
        <rect x="180" y="0" width="12" height="12" rx="2" fill="#10b981" />
        <text x="198" y="10" fill="#334155" font-size="11" font-family="system-ui">Net Operating Profit</text>
      </g>
      
      ${groups}
    </svg>
  `;
}
export function generateSensitivityAnalysisSvg(financials) {
    const width = 640;
    const height = 260;
    const padLeft = 190;
    const padRight = 80;
    const padTop = 35;
    const barHeight = 18;
    const gap = 9;
    const topItems = financials.sensitivityAnalysis.slice(0, 6);
    const maxImpact = 45;
    const zeroX = padLeft + (width - padLeft - padRight) / 2;
    const halfW = (width - padLeft - padRight) / 2;
    const bars = topItems.map((item, idx) => {
        const y = padTop + idx * (barHeight + gap);
        const isNeg = item.impactOnMonthlyProfitPct < 0;
        const barW = Math.abs((item.impactOnMonthlyProfitPct / maxImpact) * halfW);
        const startX = isNeg ? zeroX - barW : zeroX;
        const color = isNeg ? "#dc2626" : "#059669";
        return `
      <text x="${padLeft - 10}" y="${y + 14}" fill="#334155" font-size="10.5" font-weight="600" text-anchor="end" font-family="system-ui">${item.variable} (${item.variation})</text>
      <rect x="${startX}" y="${y}" width="${barW}" height="${barHeight}" rx="3" fill="${color}" />
      <text x="${isNeg ? startX - 6 : startX + barW + 6}" y="${y + 14}" fill="${color}" font-size="10.5" font-weight="700" text-anchor="${isNeg ? 'end' : 'start'}" font-family="system-ui">${item.impactOnMonthlyProfitPct > 0 ? '+' : ''}${item.impactOnMonthlyProfitPct}%</text>
    `;
    }).join("\n");
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <text x="${width / 2}" y="18" fill="#475569" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui">Profit Sensitivity to Key Operating Variables (% Change in Monthly Operating Profit)</text>
      <!-- Center Zero Line -->
      <line x1="${zeroX}" y1="${padTop - 5}" x2="${zeroX}" y2="${height - 20}" stroke="#94a3b8" stroke-width="1.5" />
      <text x="${zeroX - 40}" y="${padTop - 8}" fill="#dc2626" font-size="9.5" font-weight="600" text-anchor="middle" font-family="system-ui">◄ Negative Impact</text>
      <text x="${zeroX + 40}" y="${padTop - 8}" fill="#059669" font-size="9.5" font-weight="600" text-anchor="middle" font-family="system-ui">Positive Impact ►</text>
      ${bars}
    </svg>
  `;
}
export function generateRiskHeatmapSvg(risks) {
    const width = 640;
    const height = 240;
    const padLeft = 90;
    const padBottom = 40;
    const padTop = 30;
    const cellW = 160;
    const cellH = 55;
    const cells = [
        { p: 0, i: 0, color: "#fef08a", label: "Med (P:L, I:L)" },
        { p: 0, i: 1, color: "#fde047", label: "Moderate (P:L, I:M)" },
        { p: 0, i: 2, color: "#fca5a5", label: "High (P:L, I:H)" },
        { p: 1, i: 0, color: "#fef9c3", label: "Low (P:M, I:L)" },
        { p: 1, i: 1, color: "#fed7aa", label: "Elevated (P:M, I:M)" },
        { p: 1, i: 2, color: "#f87171", label: "Severe (P:M, I:H)" },
        { p: 2, i: 0, color: "#fde68a", label: "Moderate (P:H, I:L)" },
        { p: 2, i: 1, color: "#fb923c", label: "High Alert (P:H, I:M)" },
        { p: 2, i: 2, color: "#ef4444", label: "CRITICAL (P:H, I:H)" }
    ];
    const grid = cells.map(c => {
        const x = padLeft + c.i * cellW;
        const y = padTop + (2 - c.p) * cellH;
        return `
      <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${c.color}" stroke="#ffffff" stroke-width="2" rx="4" />
      <text x="${x + cellW / 2}" y="${y + cellH / 2 + 4}" fill="#1e293b" font-size="10.5" font-weight="600" text-anchor="middle" font-family="system-ui">${c.label}</text>
    `;
    }).join("\n");
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <!-- Axes labels -->
      <text x="25" y="${padTop + (3 * cellH) / 2}" fill="#475569" font-size="11" font-weight="700" text-anchor="middle" transform="rotate(-90, 25, ${padTop + (3 * cellH) / 2})" font-family="system-ui">Probability ▲</text>
      <text x="${padLeft + (3 * cellW) / 2}" y="${height - 10}" fill="#475569" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui">Impact Severity ►</text>
      
      <!-- Axis Tick Labels -->
      <text x="${padLeft - 10}" y="${padTop + cellH / 2 + 4}" fill="#64748b" font-size="10" font-weight="600" text-anchor="end" font-family="system-ui">High</text>
      <text x="${padLeft - 10}" y="${padTop + cellH + cellH / 2 + 4}" fill="#64748b" font-size="10" font-weight="600" text-anchor="end" font-family="system-ui">Medium</text>
      <text x="${padLeft - 10}" y="${padTop + 2 * cellH + cellH / 2 + 4}" fill="#64748b" font-size="10" font-weight="600" text-anchor="end" font-family="system-ui">Low</text>
      
      <text x="${padLeft + cellW / 2}" y="${padTop + 3 * cellH + 18}" fill="#64748b" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui">Low Impact</text>
      <text x="${padLeft + cellW + cellW / 2}" y="${padTop + 3 * cellH + 18}" fill="#64748b" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui">Medium Impact</text>
      <text x="${padLeft + 2 * cellW + cellW / 2}" y="${padTop + 3 * cellH + 18}" fill="#64748b" font-size="10" font-weight="600" text-anchor="middle" font-family="system-ui">High Impact</text>
      
      ${grid}
    </svg>
  `;
}
export function generateTreeOfThoughtsSvg(tot) {
    const width = 640;
    const height = 280;
    const rootX = 20;
    const rootY = 110;
    const rootW = 140;
    const rootH = 60;
    const branchX = 220;
    const branchW = 390;
    const branchH = 50;
    const branchYs = [18, 78, 138, 204];
    const connectors = branchYs.map((by, i) => {
        const isSelected = !tot.branches[i]?.pruned;
        const startX = rootX + rootW;
        const startY = rootY + rootH / 2;
        const endX = branchX;
        const endY = by + branchH / 2;
        const stroke = isSelected ? "#059669" : "#94a3b8";
        const strokeW = isSelected ? "2.5" : "1.5";
        const dash = isSelected ? "" : 'stroke-dasharray="3,3"';
        return `<path d="M ${startX} ${startY} C ${startX + 35} ${startY}, ${endX - 35} ${endY}, ${endX} ${endY}" fill="none" stroke="${stroke}" stroke-width="${strokeW}" ${dash} />`;
    }).join("\n");
    const branchCards = tot.branches.map((b, i) => {
        const by = branchYs[i];
        const isSelected = !b.pruned;
        const bg = isSelected ? "#f0fdf4" : "#f8fafc";
        const border = isSelected ? "#10b981" : "#cbd5e1";
        const badgeBg = isSelected ? "#dcfce7" : "#f1f5f9";
        const badgeColor = isSelected ? "#15803d" : "#64748b";
        const badgeText = isSelected ? `SELECTED: ${b.scores.compositeScore.toFixed(1)} / 100` : `PRUNED: ${b.scores.compositeScore.toFixed(1)}`;
        return `
      <g transform="translate(${branchX}, ${by})">
        <rect width="${branchW}" height="${branchH}" rx="6" fill="${bg}" stroke="${border}" stroke-width="${isSelected ? 2 : 1}" />
        <text x="12" y="20" fill="#0f172a" font-size="11" font-weight="${isSelected ? 700 : 600}" font-family="system-ui">${b.archetypeName}</text>
        <text x="12" y="38" fill="#64748b" font-size="9" font-family="system-ui">${b.spaceAndCapexProfile.sqft} sqft | CAPEX: ₹${(b.spaceAndCapexProfile.estimatedCapex / 100000).toFixed(1)}L | Payback: ${b.unitEconomicsProfile.paybackMonths} Mo</text>
        
        <rect x="${branchW - 130}" y="12" width="120" height="24" rx="4" fill="${badgeBg}" />
        <text x="${branchW - 70}" y="28" fill="${badgeColor}" font-size="9.5" font-weight="700" text-anchor="middle" font-family="system-ui">${badgeText}</text>
      </g>
    `;
    }).join("\n");
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <!-- Title -->
      <text x="${width / 2}" y="14" fill="#475569" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui">Tree of Thoughts (ToT) Multi-Branch Evaluation &amp; Strategic Pruning</text>

      <!-- Connectors -->
      ${connectors}

      <!-- Root Problem Node -->
      <g transform="translate(${rootX}, ${rootY})">
        <rect width="${rootW}" height="${rootH}" rx="6" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <text x="${rootW / 2}" y="24" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui">STRATEGIC ENTRY</text>
        <text x="${rootW / 2}" y="42" fill="#94a3b8" font-size="8.5" text-anchor="middle" font-family="system-ui">4 Competing Models</text>
      </g>

      <!-- Branch Cards -->
      ${branchCards}
    </svg>
  `;
}
//# sourceMappingURL=visualizer.js.map
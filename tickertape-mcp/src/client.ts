/**
 * Tickertape HTTP Client
 * Handles communication with Tickertape's public web endpoints
 * All network calls are strictly logged to stderr.
 */

const BASE_API_URL = "https://api.tickertape.in";
const QUOTES_API_URL = "https://quotes-api.tickertape.in";
const GMS_API_URL = "https://gms-api.tickertape.in";

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Referer": "https://www.tickertape.in/",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  ...(process.env.TICKERTAPE_COOKIE ? { "Cookie": process.env.TICKERTAPE_COOKIE } : {}),
  ...(process.env.TICKERTAPE_AUTH_TOKEN ? { "Authorization": `Bearer ${process.env.TICKERTAPE_AUTH_TOKEN}` } : {}),
};

export interface MarketMoodData {
  score: number;
  zone: "Extreme Fear" | "Fear" | "Greed" | "Extreme Greed";
  description: string;
  actionableInsight: string;
  date: string;
  indicators: {
    fiiIndexFuturesFlow: number;
    volatilityAndSkew: number;
    momentum: number;
    marketBreadthTrin: number;
    priceStrengthExtrema: number;
    demandForGoldOnNifty: number;
    niftyLevel: number;
    goldLevel: number;
  };
}

export interface SearchResultItem {
  sid: string;
  ticker: string;
  name: string;
  type: string;
  sector?: string;
  marketCap?: number;
  price?: number;
  change?: number;
  slug?: string;
}

export interface StockInfoData {
  sid: string;
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  description: string;
  tags?: string[];
  valuation: {
    pe: number | null;
    pb: number | null;
    industryPe: number | null;
    industryPb: number | null;
    dividendYield: number | null;
    industryDivYield: number | null;
    eps: number | null;
  };
  performance: {
    roe: number | null;
    beta: number | null;
    marketCap: number | null;
    marketCapRank: number | null;
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
    threeMonthAvgVolume: number | null;
    riskScore: number | null;
  };
}

export interface QuoteData {
  sid: string;
  type?: string;
  exchange: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  weekChangePercent?: number | null;
  monthChangePercent?: number | null;
  away52wHigh?: number | null;
  away52wLow?: number | null;
}

export interface ScreenerOptions {
  sectors?: string[];
  sortBy?: "marketCap" | "pe" | "roe" | "divYield" | "closePrice";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ScreenerResultItem {
  sid: string;
  name: string;
  ticker: string;
  sector: string;
  marketCap: number;
  closePrice?: number;
  pe?: number;
  roe?: number;
  divYield?: number;
  slug?: string;
}

export interface ShareholdingItem {
  date: string;
  promoterTotalPct: number;
  promoterPledgedPct: number;
  mutualFundPct: number;
  domesticInstTotalPct: number;
  foreignInstTotalPct: number;
  insurancePct: number;
  redFlagWarning?: string;
}

export interface EtfInfoData {
  sid: string;
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  amc: string;
  description: string;
  aum: number | null;
  expenseRatio: number | null;
  industryExpenseRatio: number | null;
  trackingError: number | null;
  industryTrackingError: number | null;
  liquidityRating: string | null;
  lastPrice: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  beta: number | null;
}

export interface UsQuoteData {
  ticker: string;
  price: number;
  lastClosePrice: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface ForexQuoteData {
  pair: string;
  rate: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export class TickertapeClient {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = { ...DEFAULT_HEADERS, ...(options.headers as Record<string, string> || {}) };
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Tickertape API error (${response.status} ${response.statusText}): ${errorText.slice(0, 200)}`);
    }

    const json = (await response.json()) as any;
    return json;
  }

  /**
   * Fetches the current Market Mood Index (MMI)
   */
  async getMarketMoodIndex(): Promise<MarketMoodData> {
    const json = await this.request<any>(`${BASE_API_URL}/mmi/now`);
    const raw = json.data;
    if (!raw) {
      throw new Error("Invalid response format from MMI endpoint");
    }

    const score = Number(raw.indicator.toFixed(2));
    let zone: MarketMoodData["zone"] = "Fear";
    let description = "";
    let actionableInsight = "";

    if (score < 30) {
      zone = "Extreme Fear";
      description = "Widespread fear and panic dominate the market. Equities may be heavily oversold.";
      actionableInsight = "Historically attractive contrarian accumulation window for fundamentally resilient companies. Good zone for lump-sum investments.";
    } else if (score < 50) {
      zone = "Fear";
      description = "Cautious sentiment prevails. Market participants are hesitant.";
      actionableInsight = "Reasonable zone for systematic investment (SIP) and disciplined dollar-cost averaging.";
    } else if (score < 70) {
      zone = "Greed";
      description = "Bullish momentum and general optimism across market participants.";
      actionableInsight = "Valuations are expanding. Exercise discipline, avoid FOMO purchases at elevated multiples.";
    } else {
      zone = "Extreme Greed";
      description = "Euphoric and frothy market conditions. High risk of mean-reversion or sharp corrections.";
      actionableInsight = "Review stop-losses, consider trimming overvalued speculative positions, and avoid aggressive lump-sum entries.";
    }

    return {
      score,
      zone,
      description,
      actionableInsight,
      date: raw.date,
      indicators: {
        fiiIndexFuturesFlow: raw.fii,
        volatilityAndSkew: raw.skew,
        momentum: raw.momentum,
        marketBreadthTrin: raw.trin,
        priceStrengthExtrema: raw.extrema,
        demandForGoldOnNifty: raw.goldOnNifty,
        niftyLevel: raw.nifty,
        goldLevel: raw.gold,
      },
    };
  }

  /**
   * Searches securities (stocks, mutual funds, ETFs, indices)
   */
  async search(query: string, types?: string[]): Promise<SearchResultItem[]> {
    const selectedTypes = types && types.length > 0 ? types.join(",") : "stock,etf,mutualfund,indices";
    const url = `${BASE_API_URL}/search?text=${encodeURIComponent(query)}&types=${selectedTypes}`;
    const json = await this.request<any>(url);

    const stocks = json.data?.stocks || [];
    return stocks.map((item: any) => ({
      sid: item.sid,
      ticker: item.ticker,
      name: item.name,
      type: item.type,
      sector: item.sector,
      marketCap: item.marketCap,
      price: item.quote?.price,
      change: item.quote?.change,
      slug: item.slug,
    }));
  }

  /**
   * Fetches fundamental stock information & ratios
   */
  async getStockInfo(sid: string): Promise<StockInfoData> {
    const cleanSid = sid.startsWith(".") ? sid : sid.toUpperCase();
    const url = `${BASE_API_URL}/stocks/info/${encodeURIComponent(cleanSid)}`;
    const json = await this.request<any>(url);
    const data = json.data;
    if (!data) {
      throw new Error(`No stock info found for symbol '${sid}'`);
    }

    const info = data.info || {};
    const ratios = data.ratios || {};

    return {
      sid: data.sid || cleanSid,
      ticker: info.ticker || "",
      name: info.name || "",
      exchange: info.exchange || "NSE",
      sector: info.sector || "",
      description: info.description || "",
      tags: info.tags || [],
      valuation: {
        pe: ratios.pe ?? null,
        pb: ratios.pb ?? null,
        industryPe: ratios.indpe ?? null,
        industryPb: ratios.indpb ?? null,
        dividendYield: ratios.divYield ?? null,
        industryDivYield: ratios.inddy ?? null,
        eps: ratios.eps ?? null,
      },
      performance: {
        roe: ratios.roe ?? null,
        beta: ratios.beta ?? null,
        marketCap: ratios.marketCap ?? null,
        marketCapRank: ratios.mrktCapRank ?? null,
        fiftyTwoWeekHigh: ratios["52wHigh"] ?? null,
        fiftyTwoWeekLow: ratios["52wLow"] ?? null,
        threeMonthAvgVolume: ratios["3mAvgVol"] ?? null,
        riskScore: ratios.risk ?? null,
      },
    };
  }

  /**
   * Fetches real-time price quotes for multiple securities (stocks, ETFs, indices like .NSEI, .BSESN)
   */
  async getLiveQuotes(sids: string[]): Promise<QuoteData[]> {
    if (sids.length === 0) return [];
    const formattedSids = sids.map((s) => (s.startsWith(".") ? s : s.toUpperCase())).join(",");
    const url = `${QUOTES_API_URL}/quotes?sids=${encodeURIComponent(formattedSids)}`;
    const json = await this.request<any>(url);

    const dataList = json.data || [];
    return dataList.map((q: any) => {
      const price = q.price ?? 0;
      const close = q.c ?? price;
      const change = q.change ?? Number((price - close).toFixed(2));
      const changePercent = q.dyChange ?? (close !== 0 ? Number((((price - close) / close) * 100).toFixed(2)) : 0);

      return {
        sid: q.sid,
        type: q.type || "stock",
        exchange: q.exchange || "NSE",
        price,
        open: q.o ?? 0,
        high: q.h ?? 0,
        low: q.l ?? 0,
        close,
        change,
        changePercent,
        volume: q.vol ?? 0,
        weekChangePercent: q.wkChange ?? null,
        monthChangePercent: q.mnChange ?? null,
        away52wHigh: q.away52wH ?? null,
        away52wLow: q.away52wL ?? null,
      };
    });
  }

  /**
   * Queries the stock screener engine
   */
  async runScreener(options: ScreenerOptions = {}): Promise<ScreenerResultItem[]> {
    const url = `${BASE_API_URL}/screener/query`;
    const body: Record<string, any> = {
      match: options.sectors && options.sectors.length > 0 ? { sector: options.sectors } : {},
      sortBy: options.sortBy || "marketCap",
      sortOrder: options.sortOrder === "asc" ? 1 : -1,
      project: ["subslug", "name", "ticker", "marketCap", "closePrice", "pe", "divYield", "roe"],
      offset: options.offset || 0,
      count: Math.min(options.limit || 15, 50),
    };

    const json = await this.request<any>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const results = json.data?.results || [];
    return results.map((item: any) => {
      const stock = item.stock || {};
      const adv = stock.advancedRatios || {};
      const info = stock.info || {};
      return {
        sid: item.sid,
        name: info.name || "",
        ticker: info.ticker || "",
        sector: info.sector || "",
        marketCap: adv.marketCap || 0,
        closePrice: adv.closePrice,
        pe: adv.pe,
        roe: adv.roe,
        divYield: adv.divYield,
        slug: stock.slug,
      };
    });
  }

  /**
   * Fetches quarterly shareholding patterns and checks for promoter pledge red flags
   */
  async getShareholding(sid: string): Promise<ShareholdingItem[]> {
    const url = `${BASE_API_URL}/stocks/holdings/${encodeURIComponent(sid.toUpperCase())}`;
    const json = await this.request<any>(url);

    const list = json.data || [];
    return list.map((entry: any) => {
      const d = entry.data || {};
      const pledgedPct = d.pmPctP ?? d.plPctT ?? 0;
      let redFlagWarning: string | undefined;

      if (pledgedPct > 20) {
        redFlagWarning = `CRITICAL RED FLAG: High promoter pledged holdings of ${pledgedPct.toFixed(2)}%! Pledged shares indicate corporate leverage or liquidity pressure.`;
      } else if (pledgedPct > 5) {
        redFlagWarning = `MODERATE RISK: Promoter has pledged ${pledgedPct.toFixed(2)}% of their equity holdings.`;
      }

      return {
        date: entry.date,
        promoterTotalPct: d.pmPctT ?? 0,
        promoterPledgedPct: pledgedPct,
        mutualFundPct: d.mfPctT ?? 0,
        domesticInstTotalPct: d.diPctT ?? 0,
        foreignInstTotalPct: d.fiPctT ?? 0,
        insurancePct: d.isPctT ?? 0,
        ...(redFlagWarning ? { redFlagWarning } : {}),
      };
    });
  }

  /**
   * Fetches ETF profile, expense ratio, and tracking error
   */
  async getEtfInfo(sid: string): Promise<EtfInfoData> {
    const url = `${BASE_API_URL}/etfs/info/${encodeURIComponent(sid.toUpperCase())}`;
    const json = await this.request<any>(url);

    const data = json.data;
    if (!data) {
      throw new Error(`No ETF data found for symbol '${sid}'`);
    }

    const info = data.info || {};
    const ratios = data.ratios || {};

    return {
      sid: data.sid || sid.toUpperCase(),
      ticker: info.ticker || "",
      name: info.name || "",
      exchange: info.exchange || "NSE",
      sector: info.sector || "",
      amc: info.amc || "",
      description: info.description || "",
      aum: ratios.asstUnderMan ?? null,
      expenseRatio: ratios.expenseRatio ?? null,
      industryExpenseRatio: ratios.indExpenseRatio ?? null,
      trackingError: ratios.trackErr ?? null,
      industryTrackingError: ratios.indTrackErr ?? null,
      liquidityRating: ratios.etfLiqLabel ?? null,
      lastPrice: ratios.lastPrice ?? null,
      fiftyTwoWeekHigh: ratios["52wHigh"] ?? null,
      fiftyTwoWeekLow: ratios["52wLow"] ?? null,
      beta: ratios.beta ?? null,
    };
  }

  /**
   * Fetches real-time price quotes for US Stocks & US ETFs (AAPL, MSFT, NVDA, SPY, QQQ, etc.)
   */
  async getUsQuotes(tickers: string[]): Promise<UsQuoteData[]> {
    if (tickers.length === 0) return [];
    const formatted = tickers.map((t) => t.toUpperCase()).join(",");
    const url = `${GMS_API_URL}/quotes/US/latest?tickers=${encodeURIComponent(formatted)}`;
    const json = await this.request<any>(url);

    const data = json.data || {};
    return Object.keys(data)
      .filter((k) => data[k] !== null)
      .map((k) => {
        const item = data[k];
        const price = item.p;
        const lastClose = item.lcp;
        const change = Number((price - lastClose).toFixed(3));
        const changePercent = lastClose !== 0 ? Number((((price - lastClose) / lastClose) * 100).toFixed(2)) : 0;
        return {
          ticker: k,
          price,
          lastClosePrice: lastClose,
          change,
          changePercent,
          volume: item.v,
          timestamp: new Date(item.t).toISOString(),
        };
      });
  }

  /**
   * Fetches real-time Forex exchange rates (USDINR, etc.)
   */
  async getForexRates(pairs: string[]): Promise<ForexQuoteData[]> {
    if (pairs.length === 0) return [];
    const formatted = pairs.map((p) => p.toUpperCase().replace("/", "")).join(",");
    const url = `${GMS_API_URL}/quotes/FOREX/latest?tickers=${encodeURIComponent(formatted)}`;
    const json = await this.request<any>(url);

    const data = json.data || {};
    return Object.keys(data)
      .filter((k) => data[k] !== null)
      .map((k) => {
        const item = data[k];
        const rate = item.p;
        const lastClose = item.lcp;
        const change = Number((rate - lastClose).toFixed(4));
        const changePercent = lastClose !== 0 ? Number((((rate - lastClose) / lastClose) * 100).toFixed(2)) : 0;
        return {
          pair: k,
          rate,
          previousClose: lastClose,
          change,
          changePercent,
          timestamp: new Date(item.t).toISOString(),
        };
      });
  }
}

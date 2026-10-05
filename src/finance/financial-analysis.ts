export interface FinancialPeriod {
  period: string;
  revenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  cash: number;
  accountsReceivable: number;
  inventory: number;
  accountsPayable: number;
  currentAssets: number;
  currentLiabilities: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
}

export interface FinancialMetrics {
  period: string;
  grossMargin: number;
  operatingMargin: number;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  debtToEquity: number;
  returnOnAssets: number;
  operatingCashFlowMargin: number;
  freeCashFlow: number;
}

export interface FinancialFlag {
  period: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  code: string;
  message: string;
}

export interface FinancialAnalysis {
  metrics: FinancialMetrics[];
  trend: {
    revenueGrowth: number | null;
    operatingMarginChange: number | null;
    freeCashFlowChange: number | null;
  };
  flags: FinancialFlag[];
  summary: string[];
}

const safeDivide = (numerator: number, denominator: number) =>
  denominator === 0 ? null : numerator / denominator;

const finiteNumber = (value: number, field: string) => {
  if (!Number.isFinite(value)) throw new Error(`Invalid financial value for ${field}`);
  return value;
};

function validate(period: FinancialPeriod) {
  for (const [key, value] of Object.entries(period)) {
    if (key !== "period") finiteNumber(value as number, key);
  }
  if (!period.period.trim()) throw new Error("Financial period is required");
  if (period.currentAssets < 0 || period.currentLiabilities < 0) {
    throw new Error("Current assets and liabilities cannot be negative");
  }
}

export function analyzeFinancials(periods: FinancialPeriod[]): FinancialAnalysis {
  if (!periods.length) throw new Error("At least one financial period is required");
  periods.forEach(validate);

  const metrics: FinancialMetrics[] = periods.map((p) => ({
    period: p.period,
    grossMargin: safeDivide(p.revenue - p.costOfGoodsSold, p.revenue) ?? 0,
    operatingMargin: safeDivide(p.revenue - p.costOfGoodsSold - p.operatingExpenses, p.revenue) ?? 0,
    currentRatio: safeDivide(p.currentAssets, p.currentLiabilities) ?? 0,
    quickRatio: safeDivide(p.cash + p.accountsReceivable, p.currentLiabilities) ?? 0,
    cashRatio: safeDivide(p.cash, p.currentLiabilities) ?? 0,
    debtToEquity: safeDivide(p.totalLiabilities, p.equity) ?? 0,
    returnOnAssets: safeDivide(p.revenue - p.costOfGoodsSold - p.operatingExpenses, p.totalAssets) ?? 0,
    operatingCashFlowMargin: safeDivide(p.operatingCashFlow, p.revenue) ?? 0,
    freeCashFlow: p.operatingCashFlow + p.investingCashFlow
  }));

  const first = periods[0];
  const last = periods[periods.length - 1];
  const firstMetrics = metrics[0];
  const lastMetrics = metrics[metrics.length - 1];

  const revenueGrowth = safeDivide(last.revenue - first.revenue, Math.abs(first.revenue));
  const operatingMarginChange = lastMetrics.operatingMargin - firstMetrics.operatingMargin;
  const freeCashFlowChange = lastMetrics.freeCashFlow - firstMetrics.freeCashFlow;

  const flags: FinancialFlag[] = [];
  for (const [i, p] of periods.entries()) {
    const m = metrics[i];
    if (m.currentRatio < 1) flags.push({period: p.period, severity: "WARNING", code: "LOW_CURRENT_RATIO", message: "Current liabilities exceed current assets."});
    if (m.quickRatio < 0.8) flags.push({period: p.period, severity: "WARNING", code: "LOW_QUICK_RATIO", message: "Liquid current assets provide limited short-term coverage."});
    if (m.debtToEquity > 2) flags.push({period: p.period, severity: "WARNING", code: "HIGH_LEVERAGE", message: "Liabilities are more than twice equity."});
    if (m.freeCashFlow < 0) flags.push({period: p.period, severity: "CRITICAL", code: "NEGATIVE_FREE_CASH_FLOW", message: "Operating cash flow plus investing cash flow is negative."});
    if (m.operatingMargin < 0) flags.push({period: p.period, severity: "CRITICAL", code: "NEGATIVE_OPERATING_MARGIN", message: "Operating expenses and cost of goods sold exceed revenue."});
  }

  const summary: string[] = [];
  if (revenueGrowth !== null) summary.push(`Revenue changed ${(revenueGrowth * 100).toFixed(1)}% across the supplied periods.`);
  summary.push(`Operating margin changed ${(operatingMarginChange * 100).toFixed(1)} percentage points.`);
  summary.push(`Free cash flow changed by ${freeCashFlowChange.toFixed(2)} in the supplied currency units.`);
  summary.push(`Detected ${flags.length} financial risk flags requiring review.`);

  return {
    metrics,
    trend: {revenueGrowth, operatingMarginChange, freeCashFlowChange},
    flags,
    summary
  };
}

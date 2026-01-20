export interface TradeRecord {
  id: string;
  planId: string;           // 所属交易计划ID
  symbol: string;           // 币种/交易品种
  rule: 'EMA-ATR' | 'Breakout'; // 交易规则/策略
  entryTime: string;        // 入场时间
  entryPrice: number;       // 入场价格
  reason: string;          // 开单理由
  expectedStopLoss: number; // 预期止损价
  expectedTakeProfit: number; // 预期止盈价
  expectedRRRatio: number;   // 预期盈亏比（自动计算）
  
  // 实际结果（编辑时填写）
  actualExitPrice?: number; // 实际出场价格
  actualProfitLoss?: number; // 实际盈亏（含手续费）
  exitTime?: string;
  summary?: string;          // 交易总结
  
  // 图片信息
  entryImage?: string;       // 入场时图片（Base64或文件名）
  exitImage?: string;       // 出场时图片（Base64或文件名）
  
  // 状态信息
  status: 'open' | 'closed'; // 交易状态
  createdAt: string;        // 创建时间
  updatedAt: string;        // 更新时间
}

export interface TradeGroup {
  year: number;
  month: number;
  trades: TradeRecord[];
}

export interface AppState {
  trades: TradeRecord[];
  currentFilter: {
    year?: number;
    month?: number;
    symbol?: string;
    status?: 'open' | 'closed' | 'all';
  };
  isLoading: boolean;
  error: string | null;
}

export interface TradeFormData {
  rule: 'EMA-ATR' | 'Breakout';
  symbol: string;
  entryTime: string;
  entryPrice: string;
  reason: string;
  expectedStopLoss: string;
  expectedTakeProfit: string;
  entryImage?: File;
}

export interface TradeEditData {
  actualExitPrice: string;
  actualProfitLoss: string;
  summary: string;
  exitImage?: File;
}

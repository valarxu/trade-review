export interface TradePlan {
  id: string;
  content: string; // 交易计划内容
  planImage?: string; // 计划配图（Base64或文件路径）
  summary?: string; // 执行总结（编辑时填写）
  summaryImage?: string; // 总结配图
  status: 'planned' | 'reviewed'; // 状态：已制定/已复盘
  createdAt: string;
  updatedAt: string;
}

export interface PlanState {
  plans: TradePlan[];
  isLoading: boolean;
  error: string | null;
}


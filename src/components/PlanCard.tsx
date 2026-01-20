import React from 'react';
import { TradePlan } from '../types/plan';

interface PlanCardProps {
  plan: TradePlan;
  tradeCount: number;
  totalProfit: number;
  onClick: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, tradeCount, totalProfit, onClick }) => {
  const statusColor = plan.status === 'reviewed' ? 'bg-green-500' : 'bg-yellow-500';
  const statusText = plan.status === 'reviewed' ? '已复盘' : '待复盘';

  return (
    <div
      onClick={onClick}
      className="bg-dark-green-600 rounded-lg p-4 hover:bg-dark-green-700 transition-colors duration-200 cursor-pointer border border-dark-green-500 hover:border-dark-green-400"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-0.5 rounded text-xs text-black ${statusColor}`}>{statusText}</span>
        <span className="text-xs text-gray-400">
          {new Date(plan.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-gray-100 line-clamp-3 whitespace-pre-wrap mb-4 h-16">{plan.content}</p>
      
      <div className="flex justify-between items-center text-sm border-t border-dark-green-500 pt-3">
        <div className="text-gray-300">
          交易数: <span className="text-white font-bold">{tradeCount}</span>
        </div>
        <div className="text-gray-300">
          盈亏: <span className={`font-bold ${totalProfit > 0 ? 'text-green-400' : totalProfit < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {totalProfit > 0 ? '+' : ''}{totalProfit.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};


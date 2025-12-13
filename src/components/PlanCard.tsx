import React from 'react';
import { TradePlan } from '../types/plan';

interface PlanCardProps {
  plan: TradePlan;
  onClick: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onClick }) => {
  const statusColor = plan.status === 'reviewed' ? 'bg-green-500' : 'bg-yellow-500';
  const statusText = plan.status === 'reviewed' ? '已复盘' : '待复盘';

  return (
    <div
      onClick={onClick}
      className="bg-dark-green-600 rounded-lg p-4 hover:bg-dark-green-700 transition-colors duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-0.5 rounded text-xs text-black ${statusColor}`}>{statusText}</span>
        <span className="text-xs text-gray-400">
          {new Date(plan.updatedAt || plan.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-gray-100 line-clamp-3 whitespace-pre-wrap">{plan.content}</p>
      {plan.planImage && (
        <div className="mt-3">
          <img src={plan.planImage} alt="计划配图" className="w-full rounded-md" />
        </div>
      )}
    </div>
  );
};


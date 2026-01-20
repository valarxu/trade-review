import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanStore } from '../store/planStore';
import { useTradeStore } from '../store/tradeStore';
import { PlanCard } from '../components/PlanCard';
import { Plus, Target } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { plans, loadPlans } = usePlanStore();
  const { trades, loadTrades } = useTradeStore();

  useEffect(() => {
    loadPlans();
    loadTrades();
  }, []);

  const getPlanStats = (planId: string) => {
    const planTrades = trades.filter(t => t.planId === planId);
    const tradeCount = planTrades.length;
    const totalProfit = planTrades.reduce((sum, t) => sum + (t.actualProfitLoss || 0), 0);
    return { tradeCount, totalProfit };
  };

  return (
    <div className="min-h-screen bg-dark-green-500">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Target className="text-green-500" />
              交易计划
            </h1>
            <p className="text-gray-400 mt-1">管理您的交易计划与执行记录</p>
          </div>
          <button
            onClick={() => navigate('/plan/new')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>新建计划</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => {
            const stats = getPlanStats(plan.id);
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                tradeCount={stats.tradeCount}
                totalProfit={stats.totalProfit}
                onClick={() => navigate(`/plan/${plan.id}`)}
              />
            );
          })}
          {plans.length === 0 && (
             <div className="col-span-full text-center py-12 bg-dark-green-600 rounded-lg border border-dark-green-500 border-dashed">
               <p className="text-gray-400 text-lg">暂无交易计划</p>
               <button
                 onClick={() => navigate('/plan/new')}
                 className="mt-4 text-green-400 hover:text-green-300 font-medium"
               >
                 立即创建第一个计划
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

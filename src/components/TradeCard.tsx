import React from 'react';
import { TradeRecord } from '../types/trade';
import { formatCurrency, formatDate } from '../utils/calculations';
import { TrendingUp, TrendingDown, Clock, CheckCircle, DollarSign, Target, AlertTriangle } from 'lucide-react';

interface TradeCardProps {
  trade: TradeRecord;
  onClick: () => void;
}

export const TradeCard: React.FC<TradeCardProps> = ({ trade, onClick }) => {
  const isProfit = trade.actualProfitLoss !== undefined && trade.actualProfitLoss > 0;
  const isLoss = trade.actualProfitLoss !== undefined && trade.actualProfitLoss < 0;
  
  const getStatusColor = () => {
    if (trade.status === 'closed') {
      if (isProfit) return 'bg-green-600';
      if (isLoss) return 'bg-red-600';
      return 'bg-gray-600';
    }
    return 'bg-yellow-600';
  };

  const getStatusText = () => {
    if (trade.status === 'closed') {
      if (isProfit) return '盈利';
      if (isLoss) return '亏损';
      return '平仓';
    }
    return '持仓中';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-dark-green-600 rounded-lg p-4 cursor-pointer hover:bg-dark-green-700 transition-all duration-300 border border-dark-green-500 hover:border-dark-green-400 hover:shadow-lg transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-bold text-white">{trade.symbol}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="text-right">
          {trade.status === 'closed' && trade.actualProfitLoss !== undefined && (
            <div className={`flex items-center space-x-2 ${isProfit ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'}`}>
              {isProfit ? <TrendingUp size={16} /> : isLoss ? <TrendingDown size={16} /> : <CheckCircle size={16} />}
              <span className="font-bold text-lg">
                {isProfit ? '+' : ''}{formatCurrency(trade.actualProfitLoss)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Calendar size={14} className="text-dark-green-300" />
          <div>
            <p className="text-dark-green-300 text-xs">入场时间</p>
            <p className="text-white font-medium">{formatDate(trade.entryTime)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DollarSign size={14} className="text-dark-green-300" />
          <div>
            <p className="text-dark-green-300 text-xs">入场价格</p>
            <p className="text-white font-medium">{formatCurrency(trade.entryPrice, '')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <AlertTriangle size={14} className="text-dark-green-300" />
          <div>
            <p className="text-dark-green-300 text-xs">预期止损</p>
            <p className="text-white font-medium">{formatCurrency(trade.expectedStopLoss, '')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Target size={14} className="text-dark-green-300" />
          <div>
            <p className="text-dark-green-300 text-xs">预期止盈</p>
            <p className="text-white font-medium">{formatCurrency(trade.expectedTakeProfit, '')}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-dark-green-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              trade.expectedRRRatio >= 2 ? 'bg-green-400' :
              trade.expectedRRRatio >= 1 ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="text-dark-green-300 text-xs">盈亏比</span>
          </div>
          <span className={`font-bold ${
            trade.expectedRRRatio >= 2 ? 'text-green-400' :
            trade.expectedRRRatio >= 1 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            1:{trade.expectedRRRatio.toFixed(1)}
          </span>
        </div>
      </div>
      
      {/* 图片状态指示器 */}
      <div className="mt-3 flex space-x-4 text-xs">
        {trade.entryImage && (
          <div className="flex items-center space-x-1 text-green-400">
            <Clock size={12} />
            <span>入场图</span>
          </div>
        )}
        
        {trade.exitImage && (
          <div className="flex items-center space-x-1 text-blue-400">
            <CheckCircle size={12} />
            <span>出场图</span>
          </div>
        )}
      </div>
    </div>
  );
};
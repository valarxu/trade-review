import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeStore } from '../store/tradeStore';
import { TradeCard } from '../components/TradeCard';
import { YearMonthNav } from '../components/YearMonthNav';
import { groupTradesByMonth } from '../utils/calculations';
import { Plus, Filter, BarChart3, Menu, X } from 'lucide-react';

export const TradeList: React.FC = () => {
  const navigate = useNavigate();
  const { trades, currentFilter, setFilter, loadTrades, isLoading } = useTradeStore();
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const groupedTrades = groupTradesByMonth(trades);

  const filteredTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.entryTime);
    const tradeYear = tradeDate.getFullYear();
    const tradeMonth = tradeDate.getMonth() + 1;

    // 年月筛选
    if (selectedYear && tradeYear !== selectedYear) return false;
    if (selectedMonth && tradeMonth !== selectedMonth) return false;

    // 状态筛选
    if (filterStatus !== 'all' && trade.status !== filterStatus) return false;

    return true;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const aTime = new Date(a.status === 'closed' && a.exitTime ? a.exitTime : a.entryTime).getTime();
    const bTime = new Date(b.status === 'closed' && b.exitTime ? b.exitTime : b.entryTime).getTime();
    return bTime - aTime;
  });

  const handleSelectYearMonth = (year: number, month?: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setFilter({ ...currentFilter, year, month });
    setIsSidebarOpen(false); // 移动端选择后关闭侧边栏
  };

  const handleNewTrade = () => {
    navigate('/trade/new');
  };

  const handleTradeClick = (tradeId: string) => {
    navigate(`/trade/${tradeId}`);
  };

  const getTradeStats = () => {
    const total = sortedTrades.length;
    const closed = sortedTrades.filter(t => t.status === 'closed').length;
    const profitable = sortedTrades.filter(t => t.status === 'closed' && t.actualProfitLoss && t.actualProfitLoss > 0).length;
    const totalProfit = sortedTrades.reduce((sum, t) => sum + (t.actualProfitLoss || 0), 0);

    return { total, closed, profitable, totalProfit };
  };

  const stats = getTradeStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-green-500 flex items-center justify-center">
        <div className="text-gray-300">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-green-500">
      {/* 移动端侧边栏遮罩 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="container mx-auto px-4 py-6">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">交易记录</h1>
            <p className="text-gray-300">管理和分析您的交易表现</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-white p-2 rounded-md hover:bg-dark-green-600 transition-colors duration-200"
            >
              <Menu size={24} />
            </button>
            
            <button
              onClick={handleNewTrade}
              className="bg-dark-green-600 hover:bg-dark-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">新建交易</span>
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-green-600 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 size={20} className="text-blue-400" />
              <span className="text-gray-300 text-sm">总交易数</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-dark-green-600 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">已平仓</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.closed}</div>
          </div>
          <div className="bg-dark-green-600 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">盈利笔数</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.profitable}</div>
          </div>
          <div className="bg-dark-green-600 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full ${stats.totalProfit >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-gray-300 text-sm">总盈亏</span>
            </div>
            <div className={`text-2xl font-bold mt-1 ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ¥{stats.totalProfit.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex gap-6 relative">
          {/* 左侧年月导航 - 桌面版 */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <YearMonthNav
              groupedTrades={groupedTrades}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onSelectYearMonth={handleSelectYearMonth}
            />
          </div>

          {/* 左侧年月导航 - 移动版侧边栏 */}
          <div className={`fixed inset-y-0 left-0 w-64 bg-dark-green-600 z-50 transform transition-transform duration-300 lg:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">交易时间</h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-white p-1 rounded-md hover:bg-dark-green-700 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              <YearMonthNav
                groupedTrades={groupedTrades}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onSelectYearMonth={handleSelectYearMonth}
              />
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1">
            {/* 筛选器 */}
            <div className="bg-dark-green-600 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-gray-300" />
                  <span className="text-gray-300">状态筛选:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: '全部' },
                    { value: 'open', label: '持仓中' },
                    { value: 'closed', label: '已平仓' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFilterStatus(option.value as 'all' | 'open' | 'closed')}
                      className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                        filterStatus === option.value
                          ? 'bg-dark-green-700 text-white'
                          : 'bg-dark-green-700 text-gray-300 hover:bg-dark-green-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 交易卡片列表 */}
            <div className="space-y-4">
              {filteredTrades.length === 0 ? (
                <div className="text-center py-12 bg-dark-green-600 rounded-lg">
                  <div className="text-gray-400 mb-4">
                    <BarChart3 size={48} className="mx-auto opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">暂无交易记录</h3>
                  <p className="text-gray-400 mb-4">开始记录您的第一笔交易吧</p>
                  <button
                    onClick={handleNewTrade}
                    className="bg-dark-green-700 hover:bg-dark-green-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-200"
                  >
                    <Plus size={20} />
                    <span>新建交易</span>
                  </button>
                </div>
              ) : (
                sortedTrades.map(trade => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    onClick={() => handleTradeClick(trade.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

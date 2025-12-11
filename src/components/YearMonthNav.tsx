import React from 'react';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';

interface YearMonthNavProps {
  groupedTrades: { [key: string]: any[] };
  selectedYear?: number;
  selectedMonth?: number;
  onSelectYearMonth: (year: number, month?: number) => void;
}

export const YearMonthNav: React.FC<YearMonthNavProps> = ({
  groupedTrades,
  selectedYear,
  selectedMonth,
  onSelectYearMonth
}) => {
  const getYearMonthGroups = () => {
    const groups: { [year: number]: number[] } = {};
    
    Object.keys(groupedTrades).forEach(key => {
      const [year, month] = key.split('-').map(Number);
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(month);
    });
    
    // 排序
    Object.keys(groups).forEach(year => {
      groups[Number(year)].sort((a, b) => b - a);
    });
    
    return groups;
  };

  const yearMonthGroups = getYearMonthGroups();
  const years = Object.keys(yearMonthGroups).map(Number).sort((a, b) => b - a);

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar size={20} className="text-green-400" />
        <h3 className="text-lg font-semibold text-white">交易时间</h3>
      </div>
      
      <div className="space-y-2">
        {years.map(year => (
          <div key={year} className="">
            <button
              onClick={() => onSelectYearMonth(year)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-between ${
                selectedYear === year && !selectedMonth
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="font-medium">{year}年</span>
              <span className="text-sm opacity-75">
                {yearMonthGroups[year].length}个月
              </span>
            </button>
            
            {selectedYear === year && (
              <div className="ml-4 mt-1 space-y-1">
                {yearMonthGroups[year].map(month => (
                  <button
                    key={month}
                    onClick={() => onSelectYearMonth(year, month)}
                    className={`w-full text-left px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                      selectedMonth === month
                        ? 'bg-green-500 text-white'
                        : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{monthNames[month - 1]}</span>
                      <span className="text-xs opacity-75">
                        {groupedTrades[`${year}-${String(month).padStart(2, '0')}`]?.length || 0}笔
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {years.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Calendar size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无交易记录</p>
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { TradeRecord } from '../types/trade';
import { useParams, useNavigate } from 'react-router-dom';
import { useTradeStore } from '../store/tradeStore';
import { ImageUpload } from '../components/ImageUpload';
import { handleImageUpload } from '../services/imageService';
import { formatCurrency, formatDate } from '../utils/calculations';
import { ArrowLeft, Edit3, Save, TrendingUp, TrendingDown, Calendar, DollarSign, Target, AlertTriangle, Calculator } from 'lucide-react';

export const TradeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trades, updateTrade } = useTradeStore();
  
  const [trade, setTrade] = useState<TradeRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    actualExitPrice: '',
    actualProfitLoss: '',
    summary: ''
  });
  const [exitImage, setExitImage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const foundTrade = trades.find(t => t.id === id);
      if (foundTrade) {
        setTrade(foundTrade);
        if (foundTrade.status === 'open') {
          setIsEditing(true);
        }
        setEditData({
          actualExitPrice: foundTrade.actualExitPrice?.toString() || '',
          actualProfitLoss: foundTrade.actualProfitLoss?.toString() || '',
          summary: foundTrade.summary || ''
        });
        setExitImage(foundTrade.exitImage);
      }
    }
  }, [id, trades]);

  if (!trade) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">交易记录不存在</div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleExitImageUpload = async (file: File) => {
    try {
      const imageData = await handleImageUpload(file, trade.id, 'exit');
      setExitImage(imageData);
    } catch (error) {
      alert('图片上传失败: ' + (error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editData.actualExitPrice || !editData.actualProfitLoss) {
      alert('请填写实际的出场价格和盈亏');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateTrade(trade.id, {
        actualExitPrice: parseFloat(editData.actualExitPrice),
        actualProfitLoss: parseFloat(editData.actualProfitLoss),
        summary: editData.summary,
        exitImage: exitImage,
        status: 'closed'
      });
      
      setIsEditing(false);
    } catch (error) {
      alert('更新交易失败: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProfit = trade.actualProfitLoss !== undefined && trade.actualProfitLoss > 0;
  const isLoss = trade.actualProfitLoss !== undefined && trade.actualProfitLoss < 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{trade.symbol}</h1>
              <p className="text-gray-400">{formatDate(trade.entryTime)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              trade.status === 'closed' 
                ? isProfit 
                  ? 'bg-green-600 text-white' 
                  : isLoss 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-600 text-white'
                : 'bg-yellow-600 text-white'
            }`}>
              {trade.status === 'closed' 
                ? isProfit ? '盈利' : isLoss ? '亏损' : '平仓'
                : '持仓中'
              }
            </span>
            
            {trade.status === 'open' && (
              <button
                onClick={handleEditToggle}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Edit3 size={16} />
                <span>平仓</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：基本信息 */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">入场信息</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-300">入场时间</span>
                  </div>
                  <span className="text-white">{formatDate(trade.entryTime)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-gray-300">入场价格</span>
                  </div>
                  <span className="text-white">{formatCurrency(trade.entryPrice, '')}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={16} className="text-gray-400" />
                    <span className="text-gray-300">预期止损</span>
                  </div>
                  <span className="text-white">{formatCurrency(trade.expectedStopLoss, '')}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Target size={16} className="text-gray-400" />
                    <span className="text-gray-300">预期止盈</span>
                  </div>
                  <span className="text-white">{formatCurrency(trade.expectedTakeProfit, '')}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calculator size={16} className="text-green-400" />
                    <span className="text-gray-300">预期盈亏比</span>
                  </div>
                  <span className={`font-semibold ${
                    trade.expectedRRRatio >= 2 ? 'text-green-400' :
                    trade.expectedRRRatio >= 1 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    1:{trade.expectedRRRatio.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">开单理由</h2>
              <p className="text-gray-300 leading-relaxed">{trade.reason}</p>
            </div>

            {trade.entryImage && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">入场截图</h2>
                <img
                  src={trade.entryImage}
                  alt="入场截图"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>

          {/* 右侧：实际结果 */}
          <div className="space-y-6">
            {trade.status === 'closed' ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">实际结果</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">实际出场价格</span>
                    <span className="text-white">{formatCurrency(trade.actualExitPrice, '')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">实际盈亏</span>
                    <span className={`font-semibold ${
                      isProfit ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {isProfit ? '+' : ''}{formatCurrency(trade.actualProfitLoss)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                    <div className="flex items-center space-x-2">
                      {isProfit ? <TrendingUp size={16} className="text-green-400" /> : <TrendingDown size={16} className="text-red-400" />}
                      <span className="text-gray-300">交易结果</span>
                    </div>
                    <span className={`font-semibold ${
                      isProfit ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {isProfit ? '盈利' : isLoss ? '亏损' : '持平'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  <span className="text-yellow-200 font-medium">持仓中</span>
                </div>
                <p className="text-yellow-300 mt-2">此交易尚未平仓，请在平仓后更新实际结果。</p>
              </div>
            )}

            {isEditing && (
              <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">更新交易结果</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      实际出场价格 *
                    </label>
                    <input
                      type="number"
                      name="actualExitPrice"
                      value={editData.actualExitPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      实际盈亏（含手续费） *
                    </label>
                    <input
                      type="number"
                      name="actualProfitLoss"
                      value={editData.actualProfitLoss}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      交易总结 *
                    </label>
                    <textarea
                      name="summary"
                      value={editData.summary}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="总结这次交易的经验教训、执行情况、情绪管理等..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      出场截图（可选）
                    </label>
                    <ImageUpload
                      label="上传出场时的图表截图"
                      onImageUpload={handleExitImageUpload}
                      currentImage={exitImage}
                      onImageRemove={() => setExitImage(undefined)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Save size={16} />
                    <span>{isSubmitting ? '保存中...' : '保存更新'}</span>
                  </button>
                </div>
              </form>
            )}

            {trade.summary && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">交易总结</h2>
                <p className="text-gray-300 leading-relaxed">{trade.summary}</p>
              </div>
            )}

            {trade.exitImage && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">出场截图</h2>
                <img
                  src={trade.exitImage}
                  alt="出场截图"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

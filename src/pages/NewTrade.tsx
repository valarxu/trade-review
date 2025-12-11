import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeStore } from '../store/tradeStore';
import { ImageUpload } from '../components/ImageUpload';
import { calculateRiskRewardRatio } from '../utils/calculations';
import { handleImageUpload } from '../services/imageService';
import { TradeRecord } from '../types/trade';
import { ArrowLeft, Calculator, Save } from 'lucide-react';

export const NewTrade: React.FC = () => {
  const navigate = useNavigate();
  const { addTrade } = useTradeStore();
  
  const [formData, setFormData] = useState({
    symbol: '',
    entryTime: new Date().toISOString().slice(0, 16),
    entryPrice: '',
    reason: '',
    expectedStopLoss: '',
    expectedTakeProfit: ''
  });
  
  const [entryImageFile, setEntryImageFile] = useState<File | null>(null);
  const [entryImagePreview, setEntryImagePreview] = useState<string | undefined>();
  const [calculatedRRRatio, setCalculatedRRRatio] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 自动计算盈亏比
  useEffect(() => {
    const { entryPrice, expectedStopLoss, expectedTakeProfit } = formData;
    
    if (entryPrice && expectedStopLoss && expectedTakeProfit) {
      const entry = parseFloat(entryPrice);
      const stopLoss = parseFloat(expectedStopLoss);
      const takeProfit = parseFloat(expectedTakeProfit);
      
      if (!isNaN(entry) && !isNaN(stopLoss) && !isNaN(takeProfit)) {
        const ratio = calculateRiskRewardRatio(entry, stopLoss, takeProfit);
        setCalculatedRRRatio(ratio);
      } else {
        setCalculatedRRRatio(null);
      }
    } else {
      setCalculatedRRRatio(null);
    }
  }, [formData.entryPrice, formData.expectedStopLoss, formData.expectedTakeProfit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onUploadEntryImage = async (file: File) => {
    setEntryImageFile(file);
    const url = URL.createObjectURL(file);
    setEntryImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.entryPrice || !formData.reason || 
        !formData.expectedStopLoss || !formData.expectedTakeProfit) {
      alert('请填写所有必填字段');
      return;
    }

    if (calculatedRRRatio === null) {
      alert('请检查价格输入是否正确');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newTrade: Omit<TradeRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        symbol: formData.symbol.toUpperCase(),
        entryTime: formData.entryTime,
        entryPrice: parseFloat(formData.entryPrice),
        reason: formData.reason,
        expectedStopLoss: parseFloat(formData.expectedStopLoss),
        expectedTakeProfit: parseFloat(formData.expectedTakeProfit),
        expectedRRRatio: calculatedRRRatio,
        status: 'open'
      };

      const created = await addTrade(newTrade);
      if (entryImageFile) {
        try {
          await handleImageUpload(entryImageFile, created.id, 'entry');
        } catch (err) {
          console.error(err);
        }
      }
      navigate('/');
    } catch (error) {
      alert('保存交易失败: ' + (error as Error).message);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-green-500">
      <div className="container mx-auto px-4 py-6">
        {/* 头部 */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleBack}
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">新建交易</h1>
            <p className="text-gray-300">记录新的交易信息</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-dark-green-600 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">基本信息</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    币种/交易品种 *
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder="如: BTC, ETH, AAPL"
                    className="w-full px-3 py-2 bg-dark-green-700 border border-dark-green-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    入场时间 *
                  </label>
                  <input
                    type="datetime-local"
                    name="entryTime"
                    value={formData.entryTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-dark-green-700 border border-dark-green-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    入场价格 *
                  </label>
                  <input
                    type="number"
                    name="entryPrice"
                    value={formData.entryPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-dark-green-700 border border-dark-green-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    预期止损价 *
                  </label>
                  <input
                    type="number"
                    name="expectedStopLoss"
                    value={formData.expectedStopLoss}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-dark-green-700 border border-dark-green-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    预期止盈价 *
                  </label>
                  <input
                    type="number"
                    name="expectedTakeProfit"
                    value={formData.expectedTakeProfit}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-dark-green-700 border border-dark-green-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    预期盈亏比
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calculator size={16} className="text-green-400" />
                    <span className={`text-lg font-semibold ${
                      calculatedRRRatio !== null 
                        ? calculatedRRRatio >= 2 
                          ? 'text-green-400' 
                          : calculatedRRRatio >= 1 
                            ? 'text-yellow-400' 
                            : 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {calculatedRRRatio !== null 
                        ? `1:${calculatedRRRatio.toFixed(1)}`
                        : '自动计算'
                      }
                    </span>
                  </div>
                  {calculatedRRRatio !== null && (
                    <p className="text-xs text-gray-400 mt-1">
                      {calculatedRRRatio >= 2 ? '优秀的盈亏比' : 
                       calculatedRRRatio >= 1 ? '合理的盈亏比' : 
                       '风险较高的盈亏比'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  开单理由 *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="详细描述您的交易逻辑、技术分析、基本面分析等..."
                  className="w-full px-3 py-2 bg-dark-green-700 border border-dark-green-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* 图片上传 */}
            <div className="bg-dark-green-600 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">入场截图</h2>
              <ImageUpload
                label="上传入场时的图表截图（可选）"
                onImageUpload={onUploadEntryImage}
                currentImage={entryImagePreview}
                onImageRemove={() => { setEntryImageFile(null); setEntryImagePreview(undefined); }}
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-dark-green-500 rounded-md text-gray-200 hover:bg-dark-green-700 transition-colors duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200"
              >
                <Save size={16} />
                <span>{isSubmitting ? '保存中...' : '保存交易'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

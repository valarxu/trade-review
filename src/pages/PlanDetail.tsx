import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlanStore } from '../store/planStore';
import { TradePlan } from '../types/plan';
import { useTradeStore } from '../store/tradeStore';
import { TradeCard } from '../components/TradeCard';
import { ImageUpload } from '../components/ImageUpload';
import { handleImageUpload } from '../services/imageService';
import { ArrowLeft, Edit3, Save, Plus } from 'lucide-react';
import { ImagePreviewModal } from '../components/ImagePreviewModal';

export const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plans, updatePlan } = usePlanStore();
  const { trades, loadTrades } = useTradeStore();

  const [plan, setPlan] = useState<TradePlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryImage, setSummaryImage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    loadTrades();
  }, []);

  useEffect(() => {
    if (id) {
      const found = plans.find(p => p.id === id) || null;
      setPlan(found);
      if (found) {
        setSummary(found.summary || '');
        setSummaryImage(found.summaryImage);
        if (found.status === 'planned') setIsEditing(true);
      }
    }
  }, [id, plans]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">交易计划不存在</div>
      </div>
    );
  }

  const handleBack = () => navigate('/');
  const toggleEdit = () => setIsEditing(!isEditing);

  const handleSummaryImageUpload = async (file: File) => {
    try {
      const imageData = await handleImageUpload(file, plan.id, 'summary');
      setSummaryImage(imageData);
    } catch (error) {
      alert('图片上传失败: ' + (error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      alert('请填写总结');
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePlan(plan.id, {
        summary: summary.trim(),
        summaryImage,
        status: 'reviewed'
      });
      setIsEditing(false);
    } catch (error) {
      alert('更新交易计划失败: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-green-500">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleBack}
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">交易计划</h1>
            <p className="text-gray-300">查看与复盘您的计划</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-green-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">计划内容</h2>
            <p className="text-gray-100 whitespace-pre-wrap">{plan.content}</p>
            {plan.planImage && (
              <div className="mt-4">
                <img
                  src={plan.planImage}
                  alt="计划配图"
                  className="w-full rounded-lg cursor-zoom-in"
                  onClick={() => setPreviewSrc(plan.planImage!)}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {plan.status === 'reviewed' ? (
              <div className="bg-dark-green-600 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">复盘总结</h2>
                <p className="text-gray-100 whitespace-pre-wrap">{plan.summary}</p>
                {plan.summaryImage && (
                  <div className="mt-4">
                    <img
                      src={plan.summaryImage}
                      alt="总结配图"
                      className="w-full rounded-lg cursor-zoom-in"
                      onClick={() => setPreviewSrc(plan.summaryImage!)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Edit3 size={16} className="text-yellow-400" />
                  <span className="text-yellow-200 font-medium">待复盘</span>
                </div>
                <p className="text-yellow-300 mt-2">此计划尚未复盘，请补充总结以完善记录。</p>
              </div>
            )}

            {isEditing && (
              <form onSubmit={handleSubmit} className="bg-dark-green-600 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">添加复盘总结</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">总结 *</label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={4}
                      placeholder="记录执行情况、反思与改进点..."
                      className="w-full px-3 py-2 bg-dark-green-700 border border-dark-green-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">总结配图（可选）</label>
                    <ImageUpload
                      label="上传总结相关图表"
                      onImageUpload={handleSummaryImageUpload}
                      currentImage={summaryImage}
                      onImageRemove={() => setSummaryImage(undefined)}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={toggleEdit}
                    className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Save size={16} />
                    <span>保存</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {previewSrc && (
          <ImagePreviewModal src={previewSrc} onClose={() => setPreviewSrc(null)} />
        )}

        {plan.status === 'planned' && !isEditing && (
          <div className="flex justify-end mt-6">
            <button
              onClick={toggleEdit}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Edit3 size={16} />
              <span>添加总结</span>
            </button>
          </div>
        )}

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">交易记录</h2>
            <button
              onClick={() => navigate(`/trade/new?planId=${plan.id}`)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus size={16} />
              <span>新建交易</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trades.filter(t => t.planId === plan.id).map(trade => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onClick={() => navigate(`/trade/${trade.id}`)}
              />
            ))}
            {trades.filter(t => t.planId === plan.id).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400 bg-dark-green-600 rounded-lg">
                暂无交易记录
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


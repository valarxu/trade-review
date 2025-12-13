import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../components/ImageUpload';
import { handleImageUpload } from '../services/imageService';
import { usePlanStore } from '../store/planStore';
import { TradePlan } from '../types/plan';
import { ArrowLeft, Save } from 'lucide-react';

export const NewPlan: React.FC = () => {
  const navigate = useNavigate();
  const { addPlan } = usePlanStore();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onUploadPlanImage = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('请填写交易计划');
      return;
    }
    setIsSubmitting(true);
    try {
      const newPlan: Omit<TradePlan, 'id' | 'createdAt' | 'updatedAt'> = {
        content: content.trim(),
        status: 'planned',
      };
      const created = await addPlan(newPlan);
      if (imageFile) {
        try {
          await handleImageUpload(imageFile, created.id, 'plan');
        } catch (err) {
          console.error(err);
        }
      }
      navigate('/');
    } catch (error) {
      alert('保存交易计划失败: ' + (error as Error).message);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate('/');

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
            <h1 className="text-3xl font-bold text-white">新建交易计划</h1>
            <p className="text-gray-300">记录并制定您的交易计划</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-dark-green-600 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">计划内容</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="详细描述您的交易计划、目标、执行条件等..."
                className="w-full px-3 py-2 bg-dark-green-700 border border-dark-green-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="bg-dark-green-600 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">计划配图</h2>
              <ImageUpload
                label="上传计划相关图表（可选）"
                onImageUpload={onUploadPlanImage}
                currentImage={imagePreview}
                onImageRemove={() => { setImageFile(null); setImagePreview(undefined); }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-dark-green-700 hover:bg-dark-green-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Save size={18} />
                <span>保存</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


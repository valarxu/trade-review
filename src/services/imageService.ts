// 压缩图片
export function compressImage(file: File, maxWidth: number = 800, maxHeight: number = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 计算压缩后的尺寸
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为Base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// 保存图片到localStorage
export function saveImageToLocalStorage(tradeId: string, imageData: string, type: 'entry' | 'exit'): void {
  try {
    const key = `trade_image_${tradeId}_${type}`;
    localStorage.setItem(key, imageData);
  } catch (error) {
    console.error('Error saving image to localStorage:', error);
    throw new Error('Failed to save image');
  }
}

// 从localStorage加载图片
export function loadImageFromLocalStorage(tradeId: string, type: 'entry' | 'exit'): string | null {
  try {
    const key = `trade_image_${tradeId}_${type}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error loading image from localStorage:', error);
    return null;
  }
}

// 删除图片
export function deleteImageFromLocalStorage(tradeId: string, type: 'entry' | 'exit'): void {
  try {
    const key = `trade_image_${tradeId}_${type}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting image from localStorage:', error);
  }
}

// 处理图片上传
export async function handleImageUpload(file: File, tradeId: string, type: 'entry' | 'exit'): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('Image size should not exceed 5MB');
  }
  
  try {
    // 压缩图片
    const compressedImage = await compressImage(file);
    
    // 保存到localStorage
    saveImageToLocalStorage(tradeId, compressedImage, type);
    
    return compressedImage;
  } catch (error) {
    console.error('Error processing image upload:', error);
    throw new Error('Failed to process image upload');
  }
}

// 获取图片文件大小（用于显示）
export function getImageSize(base64String: string): number {
  const base64Length = base64String.split(',')[1]?.length || 0;
  return Math.ceil(base64Length * 0.75); // Base64编码大约增加33%的大小
}
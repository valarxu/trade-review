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
export function saveImageToLocalStorage(tradeId: string, imageData: string, type: 'entry' | 'exit' | 'plan' | 'summary'): void {
  try {
    const key = `trade_image_${tradeId}_${type}`;
    localStorage.setItem(key, imageData);
  } catch (error) {
    console.error('Error saving image to localStorage:', error);
    throw new Error('Failed to save image');
  }
}

// 从localStorage加载图片
export function loadImageFromLocalStorage(tradeId: string, type: 'entry' | 'exit' | 'plan' | 'summary'): string | null {
  try {
    const key = `trade_image_${tradeId}_${type}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error loading image from localStorage:', error);
    return null;
  }
}

// 删除图片
export function deleteImageFromLocalStorage(tradeId: string, type: 'entry' | 'exit' | 'plan' | 'summary'): void {
  try {
    const key = `trade_image_${tradeId}_${type}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting image from localStorage:', error);
  }
}

// 处理图片上传
export async function handleImageUpload(file: File, tradeId: string, type: 'entry' | 'exit' | 'plan' | 'summary'): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('Image size should not exceed 5MB');
  }
  
  try {
    const dataUrl = await compressImage(file);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const form = new FormData();
    form.append('file', blob, `${type}.jpg`);
    const response = await fetch(`/api/images/${tradeId}/${type}`, { method: 'POST', body: form });
    if (!response.ok) throw new Error('Failed to upload image');
    const json = await response.json();
    return json.path as string;
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

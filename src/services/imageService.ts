// 压缩图片（保留清晰度与原格式；仅在尺寸超限时缩放）
export function compressImage(
  file: File,
  maxWidth: number = 1600,
  maxHeight: number = 1200,
  jpegQuality: number = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // GIF 保持原文件（避免动画丢失）
      if (file.type === 'image/gif') {
        resolve(e.target?.result as string);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const needResize = width > maxWidth || height > maxHeight;
        if (needResize) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        } else {
          // 尺寸不超限时直接返回原始数据，避免重复编码导致清晰度下降
          resolve(e.target?.result as string);
          return;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 保留原格式：PNG 用 PNG，JPEG/WebP 用对应格式；默认降级为 JPEG
        let outMime = 'image/jpeg';
        if (file.type === 'image/png') outMime = 'image/png';
        else if (file.type === 'image/webp') outMime = 'image/webp';
        else if (file.type === 'image/jpeg' || file.type === 'image/jpg') outMime = 'image/jpeg';
        
        const compressedDataUrl =
          outMime === 'image/png'
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL(outMime, jpegQuality);
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
    // 根据数据URL的 MIME 设置正确的扩展名，避免误转为 JPG
    const mime = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
    let ext = 'jpg';
    if (mime === 'image/png') ext = 'png';
    else if (mime === 'image/webp') ext = 'webp';
    else if (mime === 'image/gif') ext = 'gif';
    else if (mime === 'image/jpeg') ext = 'jpg';
    form.append('file', blob, `${type}.${ext}`);
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

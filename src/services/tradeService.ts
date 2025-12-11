import { TradeRecord } from '../types/trade';
import { generateId } from '../utils/calculations';

const TRADES_FILE_PATH = '/data/trades.json';

// 读取交易数据
export async function loadTrades(): Promise<TradeRecord[]> {
  try {
    const response = await fetch(TRADES_FILE_PATH);
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to load trades: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading trades:', error);
    return [];
  }
}

// 保存交易数据
export async function saveTrades(trades: TradeRecord[]): Promise<void> {
  try {
    // 由于浏览器安全限制，我们不能直接写入文件系统
    // 这里使用localStorage作为临时解决方案
    // 在实际部署时，需要通过后端API或文件下载来实现
    localStorage.setItem('trades_data', JSON.stringify(trades));
    
    // 同时尝试通过下载方式保存到文件
    const dataStr = JSON.stringify(trades, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trades_backup.json';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error saving trades:', error);
    throw new Error('Failed to save trades');
  }
}

// 添加新交易
export async function addTrade(trade: Omit<TradeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TradeRecord> {
  const trades = await loadTrades();
  const newTrade: TradeRecord = {
    ...trade,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  trades.push(newTrade);
  await saveTrades(trades);
  return newTrade;
}

// 更新交易
export async function updateTrade(id: string, updates: Partial<TradeRecord>): Promise<TradeRecord> {
  const trades = await loadTrades();
  const index = trades.findIndex(trade => trade.id === id);
  
  if (index === -1) {
    throw new Error('Trade not found');
  }
  
  trades[index] = {
    ...trades[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await saveTrades(trades);
  return trades[index];
}

// 删除交易
export async function deleteTrade(id: string): Promise<void> {
  const trades = await loadTrades();
  const filteredTrades = trades.filter(trade => trade.id !== id);
  await saveTrades(filteredTrades);
}

// 从localStorage加载数据（备用方案）
export function loadTradesFromLocalStorage(): TradeRecord[] {
  try {
    const data = localStorage.getItem('trades_data');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
}

// 保存数据到localStorage（备用方案）
export function saveTradesToLocalStorage(trades: TradeRecord[]): void {
  try {
    localStorage.setItem('trades_data', JSON.stringify(trades));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}
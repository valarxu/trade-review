import { TradeRecord } from '../types/trade';

const API_BASE = '/api';

export async function loadTrades(): Promise<TradeRecord[]> {
  try {
    const response = await fetch(`${API_BASE}/trades`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading trades:', error);
    return [];
  }
}

export async function addTrade(trade: Omit<TradeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TradeRecord> {
  const response = await fetch(`${API_BASE}/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trade)
  });
  if (!response.ok) throw new Error('Failed to add trade');
  return await response.json();
}

export async function updateTrade(id: string, updates: Partial<TradeRecord>): Promise<TradeRecord> {
  const response = await fetch(`${API_BASE}/trades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update trade');
  return await response.json();
}

export async function deleteTrade(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/trades/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete trade');
}

export function loadTradesFromLocalStorage(): TradeRecord[] {
  try {
    const data = localStorage.getItem('trades_data');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
}

export function saveTradesToLocalStorage(trades: TradeRecord[]): void {
  try {
    localStorage.setItem('trades_data', JSON.stringify(trades));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

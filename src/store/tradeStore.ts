import { create } from 'zustand';
import { TradeRecord } from '../types/trade';
import { loadTradesFromLocalStorage, saveTradesToLocalStorage } from '../services/tradeService';

interface TradeState {
  trades: TradeRecord[];
  currentFilter: {
    year?: number;
    month?: number;
    symbol?: string;
    status?: 'open' | 'closed' | 'all';
  };
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  setTrades: (trades: TradeRecord[]) => void;
  addTrade: (trade: TradeRecord) => void;
  updateTrade: (id: string, updates: Partial<TradeRecord>) => void;
  deleteTrade: (id: string) => void;
  setFilter: (filter: TradeState['currentFilter']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadTrades: () => Promise<void>;
  saveTrades: () => void;
}

export const useTradeStore = create<TradeState>((set, get) => ({
  trades: [],
  currentFilter: { status: 'all' },
  isLoading: false,
  error: null,
  
  setTrades: (trades) => set({ trades }),
  
  addTrade: (trade) => {
    const { trades } = get();
    const newTrades = [...trades, trade];
    set({ trades: newTrades });
    // 自动保存
    setTimeout(() => get().saveTrades(), 0);
  },
  
  updateTrade: (id, updates) => {
    const { trades } = get();
    const newTrades = trades.map(trade => 
      trade.id === id 
        ? { ...trade, ...updates, updatedAt: new Date().toISOString() }
        : trade
    );
    set({ trades: newTrades });
    // 自动保存
    setTimeout(() => get().saveTrades(), 0);
  },
  
  deleteTrade: (id) => {
    const { trades } = get();
    const newTrades = trades.filter(trade => trade.id !== id);
    set({ trades: newTrades });
    // 自动保存
    setTimeout(() => get().saveTrades(), 0);
  },
  
  setFilter: (filter) => set({ currentFilter: filter }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  loadTrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const trades = loadTradesFromLocalStorage();
      set({ trades, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load trades',
        isLoading: false 
      });
    }
  },
  
  saveTrades: () => {
    const { trades } = get();
    try {
      saveTradesToLocalStorage(trades);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save trades'
      });
    }
  }
}));
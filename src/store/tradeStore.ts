import { create } from 'zustand';
import { TradeRecord } from '../types/trade';
import { loadTrades, addTrade as apiAddTrade, updateTrade as apiUpdateTrade, deleteTrade as apiDeleteTrade } from '../services/tradeService';

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
  addTrade: (trade: Omit<TradeRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TradeRecord>;
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
  
  addTrade: async (trade) => {
    const created = await apiAddTrade(trade);
    const { trades } = get();
    set({ trades: [...trades, created] });
    return created;
  },
  
  updateTrade: async (id, updates) => {
    const updated = await apiUpdateTrade(id, updates);
    const { trades } = get();
    const newTrades = trades.map(t => (t.id === id ? updated : t));
    set({ trades: newTrades });
  },
  
  deleteTrade: async (id) => {
    await apiDeleteTrade(id);
    const { trades } = get();
    set({ trades: trades.filter(t => t.id !== id) });
  },
  
  setFilter: (filter) => set({ currentFilter: filter }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  loadTrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const trades = await loadTrades();
      set({ trades, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load trades',
        isLoading: false 
      });
    }
  },
  
  saveTrades: () => {}
}));

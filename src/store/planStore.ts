import { create } from 'zustand';
import { TradePlan } from '../types/plan';
import { loadPlans, addPlan as apiAddPlan, updatePlan as apiUpdatePlan, deletePlan as apiDeletePlan } from '../services/planService';

interface PlanState {
  plans: TradePlan[];
  isLoading: boolean;
  error: string | null;
  setPlans: (plans: TradePlan[]) => void;
  addPlan: (plan: Omit<TradePlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TradePlan>;
  updatePlan: (id: string, updates: Partial<TradePlan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  loadPlans: () => Promise<void>;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  isLoading: false,
  error: null,

  setPlans: (plans) => set({ plans }),

  addPlan: async (plan) => {
    const created = await apiAddPlan(plan);
    const { plans } = get();
    set({ plans: [...plans, created] });
    return created;
  },

  updatePlan: async (id, updates) => {
    const updated = await apiUpdatePlan(id, updates);
    const { plans } = get();
    const newPlans = plans.map(p => (p.id === id ? updated : p));
    set({ plans: newPlans });
  },

  deletePlan: async (id) => {
    await apiDeletePlan(id);
    const { plans } = get();
    set({ plans: plans.filter(p => p.id !== id) });
  },

  loadPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const plans = await loadPlans();
      set({ plans, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load plans',
        isLoading: false 
      });
    }
  },
}));


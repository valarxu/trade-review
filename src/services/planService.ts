import { TradePlan } from '../types/plan';

const API_BASE = '/api';

export async function loadPlans(): Promise<TradePlan[]> {
  try {
    const response = await fetch(`${API_BASE}/plans`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading plans:', error);
    return [];
  }
}

export async function addPlan(plan: Omit<TradePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<TradePlan> {
  const response = await fetch(`${API_BASE}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan)
  });
  if (!response.ok) throw new Error('Failed to add plan');
  return await response.json();
}

export async function updatePlan(id: string, updates: Partial<TradePlan>): Promise<TradePlan> {
  const response = await fetch(`${API_BASE}/plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update plan');
  return await response.json();
}

export async function deletePlan(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/plans/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete plan');
}

export function loadPlansFromLocalStorage(): TradePlan[] {
  try {
    const data = localStorage.getItem('plans_data');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading plans from localStorage:', error);
    return [];
  }
}

export function savePlansToLocalStorage(plans: TradePlan[]): void {
  try {
    localStorage.setItem('plans_data', JSON.stringify(plans));
  } catch (error) {
    console.error('Error saving plans to localStorage:', error);
  }
}


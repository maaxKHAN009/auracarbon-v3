import { create } from 'zustand';

export type ProcessType = 'Direct Burning' | 'Electrical Grinding' | 'Chemical Calcination' | 'Raw Material';
export type UnitType = 'Tons' | 'kg' | 'm3' | 'liter' | 'kWh';

export interface RecipeRow {
  id: string;
  materialOrFuel: string;
  quantity: number;
  unit: UnitType;
  process: ProcessType;
}

export interface FactorsData {
  materials: Record<string, number>;
  fuels: Record<string, number>;
  grids: Record<string, number>;
}

interface CarbonStore {
  rows: RecipeRow[];
  country: string;
  totalProductOutput: number;
  factors: FactorsData | null;
  error: string | null;
  isLoading: boolean;
  vcmValue: number; // User-input VCM price per ton
  vcmCurrency: string; // Currency type (USD, EUR, GBP, etc.)
  addRow: () => void;
  updateRow: (id: string, field: keyof RecipeRow, value: string | number) => void;
  removeRow: (id: string) => void;
  setCountry: (country: string) => void;
  setTotalProductOutput: (output: number) => void;
  setVcmValue: (value: number) => void;
  setVcmCurrency: (currency: string) => void;
  setActiveUser: (userId?: string, userEmail?: string) => void;
  fetchFactors: () => Promise<void>;
  updateFactors: (newFactors: FactorsData) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

const STORAGE_KEY_BASE = 'auracarbon_store';
const AUTH_STORAGE_KEY = 'auracarbon_auth_session';
const DEFAULT_STATE = {
  rows: [] as RecipeRow[],
  country: 'Germany',
  totalProductOutput: 1000,
  factors: null as FactorsData | null,
  error: null as string | null,
  isLoading: false,
  vcmValue: 5.00, // Default VCM price
  vcmCurrency: 'USD', // Default currency
};

function buildStorageKey(userId?: string, userEmail?: string): string {
  if (userId && userId.trim()) return `${STORAGE_KEY_BASE}:user:${userId.trim()}`;
  if (userEmail && userEmail.trim()) return `${STORAGE_KEY_BASE}:email:${userEmail.trim().toLowerCase()}`;
  return `${STORAGE_KEY_BASE}:guest`;
}

function resolveInitialStorageKey(): string {
  if (typeof window === 'undefined') return buildStorageKey();
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return buildStorageKey();
    const parsed = JSON.parse(raw) as { userId?: string; userEmail?: string; isAuthenticated?: boolean };
    if (parsed?.isAuthenticated) {
      return buildStorageKey(parsed.userId, parsed.userEmail);
    }
  } catch {
    // Ignore and fall back to guest scope.
  }
  return buildStorageKey();
}

let activeStorageKey = resolveInitialStorageKey();

/** Load persisted store data from localStorage */
const loadStorageState = (storageKey: string): Partial<CarbonStore> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        rows: parsed.rows || [],
        country: parsed.country || DEFAULT_STATE.country,
        totalProductOutput: parsed.totalProductOutput || DEFAULT_STATE.totalProductOutput,
        vcmValue: parsed.vcmValue || DEFAULT_STATE.vcmValue,
        vcmCurrency: parsed.vcmCurrency || DEFAULT_STATE.vcmCurrency,
      };
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
  }
  return {};
};

/** Save store data to localStorage */
const persistStore = (rows: RecipeRow[], country: string, totalProductOutput: number, vcmValue: number, vcmCurrency: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(activeStorageKey, JSON.stringify({ rows, country, totalProductOutput, vcmValue, vcmCurrency }));
  } catch (error) {
    console.warn('Failed to persist state to localStorage:', error);
  }
};

export const useCarbonStore = create<CarbonStore>((set, get) => {
  const initialState = loadStorageState(activeStorageKey);
  
  return {
    rows: (initialState.rows as RecipeRow[]) || [],
    country: (initialState.country as string) || DEFAULT_STATE.country,
    totalProductOutput: (initialState.totalProductOutput as number) || DEFAULT_STATE.totalProductOutput,
    factors: null,
    error: null,
    isLoading: false,
    vcmValue: (initialState.vcmValue as number) || DEFAULT_STATE.vcmValue,
    vcmCurrency: (initialState.vcmCurrency as string) || DEFAULT_STATE.vcmCurrency,

    addRow: () => set((state) => {
      const newRows = [...state.rows, { 
        id: crypto.randomUUID(), 
        materialOrFuel: '', 
        quantity: 0, 
        unit: 'Tons' as UnitType, 
        process: 'Raw Material' as ProcessType 
      }];
      persistStore(newRows, state.country, state.totalProductOutput, state.vcmValue, state.vcmCurrency);
      return { rows: newRows };
    }),

    updateRow: (id, field, value) => set((state) => {
      const newRows = state.rows.map(row =>
        row.id === id
          ? { ...row, [field]: field === 'quantity' ? Math.max(0, Number(value)) : value }
          : row
      );
      persistStore(newRows, state.country, state.totalProductOutput, state.vcmValue, state.vcmCurrency);
      return { rows: newRows };
    }),

    removeRow: (id) => set((state) => {
      const newRows = state.rows.filter(row => row.id !== id);
      persistStore(newRows, state.country, state.totalProductOutput, state.vcmValue, state.vcmCurrency);
      return { rows: newRows };
    }),

    setCountry: (country) => set((state) => {
      persistStore(state.rows, country, state.totalProductOutput, state.vcmValue, state.vcmCurrency);
      return { country };
    }),

    setTotalProductOutput: (output) => set((state) => {
      const validOutput = Math.max(1, Number(output) || 1);
      persistStore(state.rows, state.country, validOutput, state.vcmValue, state.vcmCurrency);
      return { totalProductOutput: validOutput };
    }),

    fetchFactors: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch('/api/factors');
        if (!res.ok) throw new Error(`Failed to fetch factors: ${res.statusText}`);
        const data = await res.json();
        
        // Validate factors data structure
        if (!data.materials || !data.fuels || !data.grids) {
          throw new Error('Invalid factors data structure');
        }
        
        set({ factors: data, isLoading: false });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error fetching factors';
        console.error('Failed to fetch factors:', error);
        set({ error: errorMsg, isLoading: false });
      }
    },

    updateFactors: async (newFactors) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch('/api/factors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFactors)
        });
        if (!res.ok) throw new Error(`Failed to update factors: ${res.statusText}`);
        set({ factors: newFactors, isLoading: false });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error updating factors';
        console.error('Failed to update factors:', error);
        set({ error: errorMsg, isLoading: false });
      }
    },

    clearError: () => set({ error: null }),

    setVcmValue: (value) => set((state) => {
      const validValue = Math.max(0, Number(value) || 0);
      persistStore(state.rows, state.country, state.totalProductOutput, validValue, state.vcmCurrency);
      return { vcmValue: validValue };
    }),

    setVcmCurrency: (currency) => set((state) => {
      persistStore(state.rows, state.country, state.totalProductOutput, state.vcmValue, currency);
      return { vcmCurrency: currency };
    }),

    setActiveUser: (userId, userEmail) => {
      const nextKey = buildStorageKey(userId, userEmail);
      activeStorageKey = nextKey;
      const scopedState = loadStorageState(nextKey);

      set((state) => ({
        rows: (scopedState.rows as RecipeRow[]) || [],
        country: (scopedState.country as string) || DEFAULT_STATE.country,
        totalProductOutput: (scopedState.totalProductOutput as number) || DEFAULT_STATE.totalProductOutput,
        vcmValue: (scopedState.vcmValue as number) || DEFAULT_STATE.vcmValue,
        vcmCurrency: (scopedState.vcmCurrency as string) || DEFAULT_STATE.vcmCurrency,
        factors: state.factors,
        error: null,
      }));
    },

    resetStore: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(activeStorageKey);
      }
      set(DEFAULT_STATE);
    },
  };
});

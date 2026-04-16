import { create } from 'zustand';
import { Problem } from '../services/problemService';

interface AppState {
  problems: Problem[];
  setProblems: (problems: Problem[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterDifficulty: string;
  setFilterDifficulty: (difficulty: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export const useStore = create<AppState>((set) => ({
  problems: [],
  setProblems: (problems) => set({ problems }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  filterDifficulty: 'All',
  setFilterDifficulty: (filterDifficulty) => set({ filterDifficulty }),
  filterStatus: 'All',
  setFilterStatus: (filterStatus) => set({ filterStatus }),
}));

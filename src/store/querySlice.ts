import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Query, QueryResult } from '../types';

interface VisualizationSuggestion {
  type: 'area' | 'bar' | 'line' | 'pie';
  title: string;
  description: string;
  metrics: string[];
  aggregation: 'sum' | 'average' | 'count' | 'min' | 'max';
}

interface AIResponse {
  data: QueryResult['data'];
  visualization: VisualizationSuggestion;
  insights: string[];
}

interface QueryHistory {
  id: string;
  text: string;
  timestamp: number;
}

interface QueryState {
  history: QueryHistory[];
  suggestions: string[];
  currentQuery: string;
  results: QueryResult;
  aiResponse: AIResponse;
}

const initialState: QueryState = {
  history: [],
  suggestions: [],
  currentQuery: '',
  results: {
    data: {
      labels: [],
      values: [],
      growth: [],
      target: []
    },
    loading: false,
    error: null
  },
  aiResponse: {
    data: {
      labels: [],
      values: [],
      growth: [],
      target: []
    },
    visualization: {
      type: 'line',
      title: 'Data Visualization',
      description: 'Shows the data distribution',
      metrics: ['value'],
      aggregation: 'sum'
    },
    insights: []
  }
};

const querySlice = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },
    addToHistory: (state, action: PayloadAction<QueryHistory>) => {
      state.history.unshift(action.payload);
    },
    removeFromHistory: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(item => item.id !== action.payload);
    },
    clearHistory: (state) => {
      state.history = [];
    },
    setResults: (state, action: PayloadAction<QueryResult>) => {
      state.results = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.results.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.results.error = action.payload;
    },
    setAIResponse: (state, action: PayloadAction<Partial<AIResponse>>) => {
      state.aiResponse = {
        ...state.aiResponse,
        ...action.payload
      };
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    }
  }
});

export const { 
  setCurrentQuery, 
  addToHistory, 
  removeFromHistory,
  clearHistory,
  setResults, 
  setLoading, 
  setError,
  setAIResponse,
  setSuggestions
} = querySlice.actions;

export default querySlice.reducer;
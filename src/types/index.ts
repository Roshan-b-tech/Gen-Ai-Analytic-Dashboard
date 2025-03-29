export interface Query {
  id: string;
  text: string;
  timestamp: number;
}

export interface QueryResult {
  data: {
    labels: string[];
    values: number[];
    growth?: number[];
    target?: number[];
  };
  loading: boolean;
  error: string | null;
}

export interface VisualizationSuggestion {
  type: 'area' | 'bar' | 'line' | 'pie';
  title: string;
  description: string;
  metrics: string[];
  aggregation: 'sum' | 'average' | 'count' | 'min' | 'max';
}

export interface AIResponse {
  data: QueryResult['data'];
  visualization: VisualizationSuggestion;
  insights: string[];
}

export interface RootState {
  queries: {
    history: Query[];
    suggestions: string[];
    currentQuery: string;
    results: QueryResult;
    aiResponse: AIResponse;
  };
}
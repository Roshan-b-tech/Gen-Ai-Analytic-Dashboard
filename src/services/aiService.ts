import axios from 'axios';

interface VisualizationSuggestion {
  type: 'area' | 'bar' | 'line' | 'pie';
  title: string;
  description: string;
  metrics: string[];
  aggregation: 'sum' | 'average' | 'count' | 'min' | 'max';
}

interface QueryResponse {
  data: any;
  visualization: VisualizationSuggestion;
  insights: string[];
}

type StreamCallback = (data: any) => void;

class AIService {
  private static instance: AIService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5000';
    console.log('AIService initialized with baseUrl:', this.baseUrl);
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async processQuery(query: string, onStream: StreamCallback): Promise<void> {
    try {
      console.log('Processing query:', query);
      const url = `${this.baseUrl}/api/process-query?query=${encodeURIComponent(query)}`;
      console.log('EventSource URL:', url);
      
      const eventSource = new EventSource(url, {
        withCredentials: true
      });
      
      eventSource.onopen = () => {
        console.log('EventSource connection opened');
      };
      
      let isComplete = false;
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Stream data received:', data);
          
          if (data.type === 'complete') {
            isComplete = true;
            eventSource.close();
          } else if (data.type === 'error') {
            console.error('Stream error:', data.content);
            eventSource.close();
          } else {
            onStream(data);
          }
        } catch (error) {
          console.error('Error parsing stream data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
      };

      // Return a promise that resolves when the stream is complete
      return new Promise((resolve, reject) => {
        const checkComplete = setInterval(() => {
          if (isComplete) {
            clearInterval(checkComplete);
            resolve();
          }
        }, 100);

        // Set a timeout to reject if the stream doesn't complete
        setTimeout(() => {
          if (!isComplete) {
            clearInterval(checkComplete);
            eventSource.close();
            reject(new Error('Stream timeout'));
          }
        }, 30000); // 30 second timeout
      });
    } catch (error) {
      console.error('Error processing query:', error);
      throw new Error('Failed to process query. Please try again.');
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      console.log('Fetching suggestions for:', query);
      const url = `${this.baseUrl}/api/suggestions?query=${encodeURIComponent(query)}`;
      console.log('Request URL:', url);
      
      // First verify the server is running
      try {
        const healthCheck = await fetch(this.baseUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'include'
        });
        
        if (!healthCheck.ok) {
          console.error('Server health check failed:', healthCheck.status);
          return [];
        }
        
        const healthData = await healthCheck.json();
        console.log('Server health check response:', healthData);
      } catch (error) {
        console.error('Server health check failed:', error);
        return [];
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('Suggestions request failed:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received suggestions data:', data);
      
      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        console.error('Invalid suggestions data:', data);
        return [];
      }
      
      return data.suggestions;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }
}

export default AIService; 
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Send, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentQuery, addToHistory, setLoading, setResults, setError, setAIResponse, setSuggestions } from '../store/querySlice';
import type { RootState, AIResponse } from '../types';
import AIService from '../services/aiService';

const QueryInput: React.FC = () => {
  const dispatch = useDispatch();
  const { currentQuery, suggestions } = useSelector((state: RootState) => state.queries);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const aiService = AIService.getInstance();

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        console.log('QueryInput: Fetching suggestions for query:', currentQuery);
        const newSuggestions = await aiService.getSuggestions(currentQuery);
        console.log('QueryInput: Received suggestions:', newSuggestions);
        dispatch(setSuggestions(newSuggestions));
        setShowSuggestions(true);
      } catch (error) {
        console.error('QueryInput: Error fetching suggestions:', error);
        dispatch(setSuggestions([]));
      }
    };

    if (currentQuery.length > 0) {
      const timeoutId = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timeoutId);
    } else {
      dispatch(setSuggestions([]));
      setShowSuggestions(false);
    }
  }, [currentQuery, dispatch]);

  // Fetch default suggestions when input is focused
  useEffect(() => {
    const fetchDefaultSuggestions = async () => {
      if (isFocused) {
        try {
          console.log('QueryInput: Fetching default suggestions');
          const defaultSuggestions = await aiService.getSuggestions('');
          console.log('QueryInput: Received default suggestions:', defaultSuggestions);
          dispatch(setSuggestions(defaultSuggestions));
          setShowSuggestions(true);
        } catch (error) {
          console.error('QueryInput: Error fetching default suggestions:', error);
        }
      }
    };

    fetchDefaultSuggestions();
  }, [isFocused, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuery.trim()) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSuggestions([])); // Clear suggestions when submitting
    setShowSuggestions(false);

    try {
      await aiService.processQuery(currentQuery, (streamData) => {
        console.log('Received stream data:', streamData);
        
        if (streamData.type === 'error') {
          dispatch(setError(streamData.content));
          dispatch(setLoading(false));
          return;
        }
        
        if (streamData.type === 'complete') {
          dispatch(setLoading(false));
          return;
        }
        
        // Handle the combined data response
        if (streamData.data && streamData.visualization && streamData.insights) {
          dispatch(setResults({
            data: streamData.data,
            loading: false,
            error: null
          }));
          
          dispatch(setAIResponse({
            visualization: streamData.visualization,
            insights: streamData.insights
          }));
        }
      });
      
      dispatch(addToHistory({
        id: Date.now().toString(),
        text: currentQuery,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error processing query:', error);
      dispatch(setError('Failed to process query'));
      dispatch(setLoading(false));
    }
  };

  const handleInputFocus = () => {
    console.log('QueryInput: Input focused');
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    console.log('QueryInput: Input blurred');
    setIsFocused(false);
    // Delay hiding suggestions to allow click events to fire
    setTimeout(() => {
      if (!isFocused) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log('QueryInput: Suggestion clicked:', suggestion);
    dispatch(setCurrentQuery(suggestion));
    setShowSuggestions(false);
    setIsFocused(false); // This will prevent suggestions from showing until next focus
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative glass-effect rounded-2xl backdrop-blur-xl border border-white/10">
            <div className="flex items-center px-6 py-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-md opacity-50"></div>
                <Search className="relative text-white/70" size={24} />
              </div>
              <input
                type="text"
                value={currentQuery}
                onChange={(e) => {
                  console.log('QueryInput: Input changed:', e.target.value);
                  dispatch(setCurrentQuery(e.target.value));
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Ask anything about your data..."
                className="flex-1 ml-4 bg-transparent outline-none placeholder-white/50 text-white text-lg font-medium"
              />
              {currentQuery && (
                <button
                  type="button"
                  onClick={() => {
                    console.log('QueryInput: Clearing input');
                    dispatch(setCurrentQuery(''));
                    dispatch(setSuggestions([]));
                    setShowSuggestions(false);
                    setIsFocused(false); // This will prevent suggestions from showing until next focus
                  }}
                  className="mr-4 p-2 text-white/50 hover:text-white/80 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
              <button
                type="submit"
                className="ml-4 px-6 py-3 bg-gradient-to-r from-[#ff3366] to-[#ff6633] text-white rounded-xl flex items-center gap-3 hover:from-[#ff4778] hover:to-[#ff774d] transition-all shadow-lg hover:shadow-[#ff3366]/20 hover:scale-105 active:scale-95 text-lg font-medium group"
              >
                <Sparkles className="group-hover:rotate-12 transition-transform" size={20} />
                <span>Generate</span>
                <Send className="group-hover:translate-x-1 transition-transform" size={18} />
              </button>
            </div>
          </div>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-4 glass-effect rounded-2xl overflow-hidden z-10 border border-white/10 backdrop-blur-xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-6 py-4 hover:bg-white/5 text-white/90 flex items-center gap-3 border-b border-white/5 last:border-0 text-lg group transition-all duration-200"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-sm opacity-30"></div>
                <Sparkles className="relative text-[#ff3366] group-hover:rotate-12 transition-transform" size={20} />
              </div>
              <span className="group-hover:translate-x-1 transition-transform">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueryInput;
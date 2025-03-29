import React from 'react';
import { Clock, Search, ArrowRight, History, Trash2, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentQuery, removeFromHistory, clearHistory } from '../store/querySlice';
import type { RootState } from '../types';

const QueryHistory: React.FC = () => {
  const dispatch = useDispatch();
  const { history } = useSelector((state: RootState) => state.queries);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleQueryClick = (query: string) => {
    dispatch(setCurrentQuery(query));
  };

  const handleDeleteQuery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the query click
    dispatch(removeFromHistory(id));
  };

  const handleClearAll = () => {
    dispatch(clearHistory());
  };

  if (!history.length) {
    return null;
  }

  return (
    <div className="glass-effect rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-md opacity-30"></div>
              <Clock className="relative text-[#ff3366]" size={24} />
            </div>
            <h2 className="text-2xl font-semibold text-white">Recent Activity</h2>
          </div>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-white/5 rounded-lg text-white/70 hover:bg-white/10 transition-all flex items-center gap-1.5 text-sm"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {history.map((query) => (
          <div
            key={query.id}
            className="group hover:bg-white/5 cursor-pointer transition-all duration-300"
            onClick={() => handleQueryClick(query.text)}
          >
            <div className="p-6 flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-sm opacity-30"></div>
                <Search className="relative text-[#ff3366] mt-1" size={22} />
              </div>
              <div className="flex-1">
                <p className="text-base text-white/90 font-medium group-hover:text-white transition-colors">{query.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <History size={14} className="text-white/40" />
                  <p className="text-sm text-white/50">{formatTime(query.timestamp)}</p>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteQuery(query.id, e)}
                className="p-1 text-white/50 hover:text-white/80 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="p-12 text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-xl opacity-30"></div>
              <div className="relative bg-white/5 rounded-full w-full h-full flex items-center justify-center">
                <Search size={32} className="text-white/30" />
              </div>
            </div>
            <p className="text-base text-white/70 font-medium">No queries yet</p>
            <p className="text-sm text-white/50 mt-2">Your search history will appear here</p>
            <div className="mt-6 px-6 py-3 bg-white/5 rounded-xl text-white/70 text-sm inline-block">
              Try asking a question about your data
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryHistory;
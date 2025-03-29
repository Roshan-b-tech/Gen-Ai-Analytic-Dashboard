import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Bar, BarChart } from 'recharts';
import { Loader2, AlertCircle, PieChart, BarChart2, Download, TrendingUp, Calendar, DollarSign, X } from 'lucide-react';
import type { RootState } from '../types';
import { setResults, setAIResponse } from '../store/querySlice';

const ResultsDisplay: React.FC = () => {
  const dispatch = useDispatch();
  const { results, aiResponse } = useSelector((state: RootState) => state.queries);
  const { data, loading, error } = results;

  const handleClear = () => {
    dispatch(setResults({ data: { labels: [], values: [], growth: [], target: [] }, loading: false, error: null }));
    dispatch(setAIResponse({ visualization: { type: 'line', title: '', description: '', metrics: [], aggregation: 'sum' }, insights: [] }));
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Month', 'Value', 'Growth (%)', 'Target'];
    const rows = data.labels.map((label, index) => [
      label,
      data.values[index].toLocaleString(),
      data.growth?.[index]?.toFixed(1) || '',
      data.target?.[index]?.toLocaleString() || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="glass-effect rounded-2xl p-12 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-xl opacity-30"></div>
            <Loader2 className="relative animate-spin text-[#ff3366] mb-6" size={48} />
          </div>
          <p className="text-white/70 text-lg font-medium">Analyzing your query...</p>
          <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#ff3366] to-[#ff6633] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect rounded-2xl p-12 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-xl opacity-30"></div>
            <AlertCircle className="relative text-[#ff3366] mb-6" size={48} />
          </div>
          <p className="text-[#ff3366] font-medium text-lg">{error}</p>
          <p className="text-white/70 text-lg mt-4">Please try again with a different query</p>
          <div className="mt-6 px-6 py-3 bg-white/5 rounded-xl text-white/70 text-sm">
            Tip: Try rephrasing your question
          </div>
        </div>
      </div>
    );
  }

  if (!data.labels.length) {
    return (
      <div className="glass-effect rounded-2xl p-12 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff3366] to-[#ff6633] rounded-full blur-xl opacity-30"></div>
            <PieChart className="relative text-white/20 mb-6" size={48} />
          </div>
          <p className="text-white/70 text-lg font-medium">Enter a query to visualize your data</p>
          <div className="mt-6 px-6 py-3 bg-white/5 rounded-xl text-white/70 text-sm">
            Example: "Show me the sales trend for the last 6 months"
          </div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    if (!data || !data.labels || !data.values) {
      return (
        <div className="flex items-center justify-center h-[400px] text-white/50">
          No data available
        </div>
      );
    }

    const chartData = data.labels.map((label, index) => ({
      name: label,
      value: data.values[index],
      growth: data.growth?.[index],
      target: data.target?.[index]
    }));

    switch (aiResponse.visualization.type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3366" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff3366" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6633" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff6633" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff70" />
              <YAxis stroke="#ffffff70" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ff3366"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
              {data.target && (
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#ff6633"
                  fillOpacity={1}
                  fill="url(#colorTarget)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff70" />
              <YAxis stroke="#ffffff70" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Bar dataKey="value" fill="#ff3366" />
              {data.target && <Bar dataKey="target" fill="#ff6633" />}
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff70" />
              <YAxis stroke="#ffffff70" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#ff3366" />
              {data.target && <Line type="monotone" dataKey="target" stroke="#ff6633" />}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-12 border border-white/10 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{aiResponse.visualization.title}</h2>
          <p className="text-white/70">{aiResponse.visualization.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Clear
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {aiResponse.insights.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiResponse.insights.map((insight, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg">
                <p className="text-white/70">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
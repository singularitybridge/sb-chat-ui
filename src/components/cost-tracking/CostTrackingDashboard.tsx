import React, { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Bot, 
  Cpu, 
  FileSpreadsheet, 
  RefreshCw,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { MetricsCards } from './MetricsCards';
import { UsageChart } from './UsageChart';
import { CostTable } from './CostTable';
import { AssistantCostGrid } from './AssistantCostGrid';
import { ModelComparison } from './ModelComparison';
import { useCostDashboard } from '../../hooks/useCostData';
import { CostFilters } from '../../types/costTracking';
import { formatCost } from '../../services/api/costTrackingService';

interface CostTrackingDashboardProps {
  className?: string;
}

export const CostTrackingDashboard: React.FC<CostTrackingDashboardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [filters, setFilters] = useState<CostFilters>({});
  
  // Fetch all dashboard data
  const {
    summary,
    records,
    recordCount,
    dailyCosts,
    isLoading,
    error,
    refetch
  } = useCostDashboard({ ...filters, ...dateRange });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleExport = () => {
    if (!records || records.length === 0) return;

    // Convert records to CSV
    const headers = ['Timestamp', 'Assistant', 'Model', 'Provider', 'Input Tokens', 'Output Tokens', 'Cost', 'Duration'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        new Date(record.timestamp).toISOString(),
        record.assistantName || 'Unknown',
        record.modelName,
        record.provider,
        record.inputTokens,
        record.outputTokens,
        record.totalCost,
        record.duration
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-tracking-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
    setFilters(prev => ({ ...prev, [`${type}Date`]: value }));
  };

  const handleProviderFilter = (provider: string) => {
    setFilters(prev => ({ 
      ...prev, 
      provider: prev.provider === provider ? undefined : provider 
    }));
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load cost data</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              AI Cost Analytics
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitor and optimize your AI usage costs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export to CSV"
              disabled={!records || records.length === 0}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              placeholder="Start date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              placeholder="End date"
            />
          </div>

          {/* Provider Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            {['openai', 'anthropic', 'google'].map(provider => (
              <button
                key={provider}
                onClick={() => handleProviderFilter(provider)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filters.provider === provider
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards summary={summary} loading={isLoading} />

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b mb-6">
          <Tabs.Trigger
            value="overview"
            className="px-4 py-2 text-sm font-medium hover:text-primary-600 data-[state=active]:text-primary-600 data-[state=active]:border-b-2 data-[state=active]:border-primary-600"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="assistants"
            className="px-4 py-2 text-sm font-medium hover:text-primary-600 data-[state=active]:text-primary-600 data-[state=active]:border-b-2 data-[state=active]:border-primary-600"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Assistants
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="models"
            className="px-4 py-2 text-sm font-medium hover:text-primary-600 data-[state=active]:text-primary-600 data-[state=active]:border-b-2 data-[state=active]:border-primary-600"
          >
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Models
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="details"
            className="px-4 py-2 text-sm font-medium hover:text-primary-600 data-[state=active]:text-primary-600 data-[state=active]:border-b-2 data-[state=active]:border-primary-600"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Details
            </div>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab Content */}
        <Tabs.Content value="overview" className="space-y-6">
          <UsageChart data={dailyCosts} loading={isLoading} />
          <CostTable data={records.slice(0, 10)} loading={isLoading} />
        </Tabs.Content>

        <Tabs.Content value="assistants">
          <AssistantCostGrid 
            summary={summary} 
            records={records}
            loading={isLoading} 
          />
        </Tabs.Content>

        <Tabs.Content value="models">
          <ModelComparison 
            summary={summary}
            records={records} 
            loading={isLoading} 
          />
        </Tabs.Content>

        <Tabs.Content value="details">
          <CostTable data={records} loading={isLoading} pageSize={20} />
        </Tabs.Content>
      </Tabs.Root>

      {/* Footer Stats */}
      {summary && (
        <div className="mt-8 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-4">
            <span>Total records: {recordCount}</span>
            <span>•</span>
            <span>Period total: {formatCost(summary.totalCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
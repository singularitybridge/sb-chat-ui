import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import {
  DollarSign,
  TrendingUp,
  Bot,
  Cpu,
  FileSpreadsheet,
  RefreshCw,
  Download,
  Filter,
  List
} from 'lucide-react';
import { MetricsCards } from './MetricsCards';
import { UsageChart } from './UsageChart';
import { CostTable } from './CostTable';
import { AssistantCostGrid } from './AssistantCostGrid';
import { ModelComparison } from './ModelComparison';
import { useCostDashboard } from '../../hooks/useCostData';
import { CostFilters } from '../../types/costTracking';
import { formatCost } from '../../services/api/costTrackingService';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Helper to get default date range (1 month ago to today)
const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return {
    start: oneMonthAgo.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0]
  };
};

// Provider display names
const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google'
};

interface CostTrackingDashboardProps {
  className?: string;
}

export const CostTrackingDashboard: React.FC<CostTrackingDashboardProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [pageSize, setPageSize] = useState<number>(10);

  // Memoize default dates to prevent re-initialization on every render
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>(defaultDates);
  const [filters, setFilters] = useState<CostFilters>({
    startDate: defaultDates.start,
    endDate: defaultDates.end,
    limit: 1000 // Increased limit for better pagination
  });

  // Fetch all dashboard data - TanStack Query handles background refetching automatically
  const {
    summary,
    records,
    recordCount,
    totalRecordCount,
    dailyCosts,
    isLoading,
    error,
    lastUpdatedAt,
    refetch
  } = useCostDashboard(filters);

  const handleExport = () => {
    if (!records || records.length === 0) return;

    try {
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

      toast.success(t('costTracking.exportSuccess'));
    } catch (error) {
      toast.error(t('costTracking.exportError'));
    }
  };

  // Convert Date to YYYY-MM-DD string format for backend
  const formatDateForBackend = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  };

  // Parse YYYY-MM-DD string to Date object for DatePicker
  const parseDateString = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr) return undefined;
    return new Date(dateStr + 'T00:00:00');
  };

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    const dateStr = formatDateForBackend(date);
    setDateRange(prev => ({ ...prev, [type]: dateStr }));
    setFilters(prev => ({
      ...prev,
      startDate: type === 'start' ? dateStr : prev.startDate,
      endDate: type === 'end' ? dateStr : prev.endDate
    }));
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
          <p className="text-destructive mb-4">Failed to load cost data</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              AI Cost Analytics
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor and optimize your AI usage costs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Export to CSV"
              disabled={!records || records.length === 0}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">From</span>
            <DatePicker
              date={parseDateString(dateRange.start)}
              onDateChange={(date) => handleDateChange('start', date)}
              placeholder="Start date"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <DatePicker
              date={parseDateString(dateRange.end)}
              onDateChange={(date) => handleDateChange('end', date)}
              placeholder="End date"
            />
          </div>

          {/* Provider Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(['openai', 'anthropic', 'google'] as const).map(provider => (
              <button
                key={provider}
                onClick={() => handleProviderFilter(provider)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filters.provider === provider
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-accent'
                }`}
              >
                {PROVIDER_LABELS[provider]}
              </button>
            ))}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-muted-foreground" />
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
              </SelectContent>
            </Select>
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
            className="px-4 py-2 text-sm font-medium hover:text-primary data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="assistants"
            className="px-4 py-2 text-sm font-medium hover:text-primary data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Assistants
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="models"
            className="px-4 py-2 text-sm font-medium hover:text-primary data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Models
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="details"
            className="px-4 py-2 text-sm font-medium hover:text-primary data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
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
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
              <span className="text-sm text-muted-foreground">{totalRecordCount} total records</span>
            </div>
            <CostTable data={records} loading={isLoading} pageSize={pageSize} totalCount={totalRecordCount} />
          </div>
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
          <CostTable data={records} loading={isLoading} pageSize={pageSize} totalCount={totalRecordCount} />
        </Tabs.Content>
      </Tabs.Root>

      {/* Footer Stats */}
      {summary && (
        <div className="mt-8 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Last updated: {lastUpdatedAt?.toLocaleTimeString() ?? 'Loading...'}
          </div>
          <div className="flex items-center gap-4">
            <span>Total records: {totalRecordCount}</span>
            <span>•</span>
            <span>Period total: {formatCost(summary.totalCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
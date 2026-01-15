import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Type assertions to fix Recharts TypeScript issues
const PieChartTyped = PieChart as any;
const PieTyped = Pie as any;
const CellTyped = Cell as any;
const BarChartTyped = BarChart as any;
const XAxisTyped = XAxis as any;
const YAxisTyped = YAxis as any;
const LegendTyped = Legend as any;
const TooltipTyped = Tooltip as any;
const BarTyped = Bar as any;
import { Cpu, DollarSign, Zap, Hash } from 'lucide-react';
import { CostSummary, CostRecord } from '../../types/costTracking';
import { formatCost, formatTokens, formatDuration } from '../../services/api/costTrackingService';
import { ModelIndicator } from '../ModelIndicator';

interface ModelComparisonProps {
  summary: CostSummary | null;
  records: CostRecord[];
  loading?: boolean;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

// Custom tooltip for dark mode support
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground p-3 border border-border rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-foreground">{label || payload[0]?.name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="text-xs mt-1">
            <span className="font-medium" style={{ color: entry.color || entry.fill }}>
              {entry.name}:
            </span>
            <span className="text-foreground ml-1">
              {typeof entry.value === 'number' ? formatCost(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  summary,
  records,
  loading = false
}) => {
  // Calculate model statistics
  const modelStats = React.useMemo(() => {
    if (!summary?.byModel) return [];

    return Object.entries(summary.byModel).map(([model, data]) => ({
      model,
      cost: data.cost,
      requests: data.requests,
      tokens: data.tokens,
      avgCost: data.requests > 0 ? data.cost / data.requests : 0
    })).sort((a, b) => b.cost - a.cost);
  }, [summary]);

  // Calculate provider statistics for pie chart
  const providerStats = React.useMemo(() => {
    if (!summary?.byProvider) return [];

    return Object.entries(summary.byProvider).map(([provider, data]) => ({
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
      value: data.cost,
      requests: data.requests,
      tokens: data.tokens
    }));
  }, [summary]);

  // Calculate performance metrics per model
  const performanceMetrics = React.useMemo(() => {
    if (!records || records.length === 0) return [];

    const metricsMap = new Map<string, {
      model: string;
      avgDuration: number;
      avgTokensPerSec: number;
      count: number;
      totalDuration: number;
      totalTokens: number;
    }>();

    records.forEach(record => {
      const existing = metricsMap.get(record.modelName);
      const tokensPerSec = record.duration > 0 
        ? (record.totalTokens / record.duration) * 1000 
        : 0;

      if (existing) {
        existing.count += 1;
        existing.totalDuration += record.duration;
        existing.totalTokens += record.totalTokens;
        existing.avgDuration = existing.totalDuration / existing.count;
        existing.avgTokensPerSec = (existing.totalTokens / existing.totalDuration) * 1000;
      } else {
        metricsMap.set(record.modelName, {
          model: record.modelName,
          avgDuration: record.duration,
          avgTokensPerSec: tokensPerSec,
          count: 1,
          totalDuration: record.duration,
          totalTokens: record.totalTokens
        });
      }
    });

    return Array.from(metricsMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [records]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 bg-accent rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-secondary rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 bg-accent rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-secondary rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (modelStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No model cost data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{modelStats.length}</p>
              </div>
              <Cpu className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Used Model</p>
                <p className="text-lg font-bold truncate">
                  {modelStats[0]?.model || 'N/A'}
                </p>
              </div>
              <Hash className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cheapest per Request</p>
                <p className="text-lg font-bold truncate">
                  {modelStats.sort((a, b) => a.avgCost - b.avgCost)[0]?.model || 'N/A'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fastest Model</p>
                <p className="text-lg font-bold truncate">
                  {performanceMetrics[0]?.model || 'N/A'}
                </p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {/* @ts-ignore */}
              <PieChartTyped>
                <PieTyped
                  data={providerStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {providerStats.map((_, index) => (
                    <CellTyped key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </PieTyped>
                <TooltipTyped content={<CustomTooltip />} />
                <LegendTyped />
              </PieChartTyped>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Cost Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {/* @ts-ignore */}
              <BarChartTyped data={modelStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxisTyped 
                  dataKey="model" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxisTyped fontSize={12} tickFormatter={(value: any) => `$${value}`} />
                <TooltipTyped content={<CustomTooltip />} />
                <BarTyped dataKey="cost" fill="#8b5cf6" />
              </BarChartTyped>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Model Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Model Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Model</th>
                  <th className="text-right py-2">Total Cost</th>
                  <th className="text-right py-2">Requests</th>
                  <th className="text-right py-2">Avg Cost/Request</th>
                  <th className="text-right py-2">Total Tokens</th>
                  <th className="text-right py-2">Avg Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {modelStats.map((model) => {
                  const perf = performanceMetrics.find(p => p.model === model.model);
                  return (
                    <tr key={model.model} className="hover:bg-accent">
                      <td className="py-3">
                        <ModelIndicator modelName={model.model} size="small" />
                      </td>
                      <td className="text-right py-3 font-medium">
                        {formatCost(model.cost)}
                      </td>
                      <td className="text-right py-3">
                        {model.requests.toLocaleString()}
                      </td>
                      <td className="text-right py-3">
                        {formatCost(model.avgCost)}
                      </td>
                      <td className="text-right py-3">
                        {formatTokens(model.tokens)}
                      </td>
                      <td className="text-right py-3">
                        {perf ? formatDuration(perf.avgDuration) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
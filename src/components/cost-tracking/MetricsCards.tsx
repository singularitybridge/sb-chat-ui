import React from 'react';
import { Card, CardContent } from '../ui/card';
import { DollarSign, BarChart3, Hash, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCost, formatTokens, formatDuration } from '../../services/api/costTrackingService';
import { CostSummary } from '../../types/costTracking';

interface MetricsCardsProps {
  summary: CostSummary | null;
  loading?: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  loading
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{title}</p>
                {subtitle && (
                  <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                )}
              </>
            )}
          </div>
          <div className="flex items-start space-x-2">
            {trend !== undefined && !loading && (
              <div className="flex items-center">
                {trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : null}
                {trend !== 0 && (
                  <span className={`text-xs ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                )}
              </div>
            )}
            <div className="p-1.5 bg-gray-100 rounded">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricsCards: React.FC<MetricsCardsProps> = ({ summary, loading = false }) => {
  const totalCost = summary ? formatCost(summary.totalCost) : '$0.00';
  const totalRequests = summary ? summary.totalRequests.toLocaleString() : '0';
  const totalTokens = summary ? formatTokens(summary.totalInputTokens + summary.totalOutputTokens) : '0';
  const avgDuration = summary ? formatDuration(summary.averageDuration) : '0s';
  
  // Calculate cost per request
  const costPerRequest = summary && summary.totalRequests > 0 
    ? formatCost(summary.totalCost / summary.totalRequests)
    : '$0.00';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        icon={<DollarSign className="w-4 h-4 text-primary-600" />}
        title="Total Cost"
        value={totalCost}
        subtitle={`${costPerRequest} per request`}
        loading={loading}
      />
      <MetricCard
        icon={<BarChart3 className="w-4 h-4 text-blue-600" />}
        title="Total Requests"
        value={totalRequests}
        loading={loading}
      />
      <MetricCard
        icon={<Hash className="w-4 h-4 text-purple-600" />}
        title="Total Tokens"
        value={totalTokens}
        subtitle={summary ? `${formatTokens(summary.totalInputTokens)} in / ${formatTokens(summary.totalOutputTokens)} out` : undefined}
        loading={loading}
      />
      <MetricCard
        icon={<Zap className="w-4 h-4 text-yellow-600" />}
        title="Avg Response Time"
        value={avgDuration}
        loading={loading}
      />
    </div>
  );
};
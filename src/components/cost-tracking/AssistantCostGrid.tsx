import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bot, DollarSign, BarChart3 } from 'lucide-react';
import { CostSummary, CostRecord } from '../../types/costTracking';
import { formatCost, formatDuration } from '../../services/api/costTrackingService';

interface AssistantCostGridProps {
  summary: CostSummary | null;
  records: CostRecord[];
  loading?: boolean;
}

interface AssistantStats {
  assistantId: string;
  assistantName: string;
  totalCost: number;
  requestCount: number;
  avgResponseTime: number;
  primaryModel: string;
  lastUsed: string;
}

export const AssistantCostGrid: React.FC<AssistantCostGridProps> = ({
  summary,
  records,
  loading = false
}) => {
  // Calculate assistant statistics from records
  const assistantStats: AssistantStats[] = React.useMemo(() => {
    if (!records || records.length === 0) return [];

    const statsMap = new Map<string, AssistantStats>();

    records.forEach(record => {
      const key = record.assistantId;
      const existing = statsMap.get(key);

      if (existing) {
        existing.totalCost += record.totalCost;
        existing.requestCount += 1;
        existing.avgResponseTime = 
          (existing.avgResponseTime * (existing.requestCount - 1) + record.duration) / existing.requestCount;
        
        // Update last used
        if (new Date(record.timestamp) > new Date(existing.lastUsed)) {
          existing.lastUsed = record.timestamp;
        }

        // Track most used model
        // This is simplified - in production, you'd want to track model usage counts
        existing.primaryModel = record.modelName;
      } else {
        statsMap.set(key, {
          assistantId: record.assistantId,
          assistantName: record.assistantName || 'Unknown Assistant',
          totalCost: record.totalCost,
          requestCount: 1,
          avgResponseTime: record.duration,
          primaryModel: record.modelName,
          lastUsed: record.timestamp
        });
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalCost - a.totalCost);
  }, [records]);

  // Combine with summary data if available
  const enrichedStats = React.useMemo(() => {
    if (!summary?.byAssistant) return assistantStats;

    return assistantStats.map(stat => {
      const summaryData = summary.byAssistant.find(
        a => a.assistantId === stat.assistantId
      );
      
      if (summaryData && summaryData.assistantName) {
        stat.assistantName = summaryData.assistantName;
      }
      
      return stat;
    });
  }, [assistantStats, summary]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-32 bg-accent rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 w-24 bg-accent rounded" />
                <div className="h-3 w-full bg-secondary rounded" />
                <div className="h-3 w-20 bg-secondary rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (enrichedStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No assistant cost data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assistants</p>
                <p className="text-2xl font-bold">{enrichedStats.length}</p>
              </div>
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Expensive</p>
                <p className="text-lg font-bold">
                  {enrichedStats[0]?.assistantName || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {enrichedStats[0] ? formatCost(enrichedStats[0].totalCost) : '$0'}
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
                <p className="text-sm text-muted-foreground">Most Used</p>
                <p className="text-lg font-bold">
                  {enrichedStats.sort((a, b) => b.requestCount - a.requestCount)[0]?.assistantName || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {enrichedStats[0] ? `${enrichedStats[0].requestCount} requests` : '0 requests'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assistant Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {enrichedStats.map((assistant) => {
          const costPerRequest = assistant.requestCount > 0 
            ? assistant.totalCost / assistant.requestCount 
            : 0;

          return (
            <Card 
              key={assistant.assistantId} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate">
                  {assistant.assistantName}
                </CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCost(assistant.totalCost)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {assistant.requestCount} requests • {formatCost(costPerRequest)}/req
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Avg Response</span>
                      <span className="font-medium">
                        {formatDuration(assistant.avgResponseTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Primary Model</span>
                      <span className="font-medium truncate ml-2">
                        {assistant.primaryModel}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Last used {new Date(assistant.lastUsed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
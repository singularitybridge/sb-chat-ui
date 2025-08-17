import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Type assertions to fix Recharts TypeScript issues
const LineChartTyped = LineChart as any;
const BarChartTyped = BarChart as any;
const AreaChartTyped = AreaChart as any;
const XAxisTyped = XAxis as any;
const YAxisTyped = YAxis as any;
const LegendTyped = Legend as any;
const TooltipTyped = Tooltip as any;
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { DailyCost } from '../../types/costTracking';
import { formatCost } from '../../services/api/costTrackingService';
import { format, parseISO } from 'date-fns';

interface UsageChartProps {
  data: DailyCost[];
  chartType?: 'area' | 'line' | 'bar';
  height?: number;
  loading?: boolean;
}

export const UsageChart: React.FC<UsageChartProps> = ({
  data,
  chartType = 'area',
  height = 300,
  loading = false
}) => {
  // Format data for the chart
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    cost: Number(item.cost.toFixed(4)),
    formattedCost: formatCost(item.cost)
  }));

  // Custom tooltip component
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="text-xs mt-1">
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.name === 'cost' ? 'Cost: ' : `${entry.name}: `}
              </span>
              <span>
                {entry.name === 'cost' 
                  ? formatCost(entry.value)
                  : entry.value.toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="space-y-3">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No cost data available</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            {/* @ts-ignore */}
            <LineChartTyped {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxisTyped dataKey="date" fontSize={12} />
              <YAxisTyped fontSize={12} tickFormatter={(value: any) => `$${value}`} />
              <TooltipTyped content={CustomTooltip} />
              <LegendTyped />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Cost ($)"
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#06b6d4"
                strokeWidth={2}
                yAxisId="right"
                dot={{ fill: '#06b6d4', r: 4 }}
                name="Requests"
              />
              <YAxisTyped yAxisId="right" orientation="right" fontSize={12} />
            </LineChartTyped>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            {/* @ts-ignore */}
            <BarChartTyped {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxisTyped dataKey="date" fontSize={12} />
              <YAxisTyped fontSize={12} tickFormatter={(value: any) => `$${value}`} />
              <TooltipTyped content={CustomTooltip} />
              <LegendTyped />
              <Bar dataKey="cost" fill="#8b5cf6" name="Cost ($)" />
              <Bar dataKey="requests" fill="#06b6d4" name="Requests" yAxisId="right" />
              <YAxisTyped yAxisId="right" orientation="right" fontSize={12} />
            </BarChartTyped>
          </ResponsiveContainer>
        );

      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            {/* @ts-ignore */}
            <AreaChartTyped {...commonProps}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxisTyped dataKey="date" fontSize={12} />
              <YAxisTyped fontSize={12} tickFormatter={(value: any) => `$${value}`} />
              <TooltipTyped content={CustomTooltip} />
              <LegendTyped />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCost)"
                name="Cost ($)"
              />
            </AreaChartTyped>
          </ResponsiveContainer>
        );
    }
  };

  // Calculate total and average
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const avgCost = data.length > 0 ? totalCost / data.length : 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Daily Cost Trend</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Last {data.length} days • Total: {formatCost(totalCost)} • Avg: {formatCost(avgCost)}/day
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-gray-400" />
          <DollarSign className="h-5 w-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};
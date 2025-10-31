'use client';

import { useState, useEffect } from 'react';
import { PerformanceData } from '@/types';
import { Card } from '@/components/ui/Card';
import { Chart } from '@/components/ui/Chart';
import { Loading, CardLoading, ChartLoading } from '@/components/ui/Loading';

interface DashboardProps {
  districtId: string;
  districtName: string;
}

export default function Dashboard({ districtId, districtName }: DashboardProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPerformanceData();
  }, [districtId, selectedYear]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/data/district?districtId=${districtId}&year=${selectedYear}`);
      const result = await response.json();
      
      if (result.success) {
        setPerformanceData(result.data);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const response = await fetch('/api/data/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ districtId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the data after sync
        await fetchPerformanceData();
      } else {
        setError('Failed to sync data: ' + result.error);
      }
    } catch (error) {
      setError('Sync failed. Please try again.');
    }
  };

  if (loading && performanceData.length === 0) {
    return <PageLoading />;
  }

  if (error && performanceData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Data</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchPerformanceData}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentData = performanceData[0];
  const monthlyData = performanceData.slice(0, 12).reverse();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  // Calculate some derived metrics
  const utilizationRate = currentData ? 
    (currentData.fundsUtilized / currentData.totalFunds) * 100 : 0;
  
  const avgPersonDays = currentData ? 
    currentData.personDays / currentData.totalWorkers : 0;

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {districtName} District
            </h1>
            <p className="text-gray-600">
              MGNREGS Performance Dashboard • {selectedYear}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <span>🔄</span>
              Sync Latest Data
            </button>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2025, 2024, 2023, 2022].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <p className="text-yellow-800 font-medium">Data Loading Issue</p>
              <p className="text-yellow-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardLoading />
            <CardLoading />
            <CardLoading />
            <CardLoading />
          </>
        ) : currentData ? (
          <>
            <Card
              title="Total Workers"
              value={currentData.totalWorkers.toLocaleString()}
              icon="👷"
              description={`Employed in ${currentMonth}`}
            />
            <Card
              title="Person Days"
              value={currentData.personDays.toLocaleString()}
              icon="📅"
              description={`${avgPersonDays.toFixed(1)} days/worker`}
            />
            <Card
              title="Women Participation"
              value={`${currentData.womenParticipation}%`}
              icon="👩"
              description="Female workforce"
            />
            <Card
              title="Funds Utilization"
              value={`${utilizationRate.toFixed(1)}%`}
              icon="💰"
              description={`₹${currentData.fundsUtilized.toLocaleString()} used`}
            />
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            No data available for selected period
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartLoading />
            <ChartLoading />
          </>
        ) : monthlyData.length > 0 ? (
          <>
            <Chart
              title="Monthly Employment Trends"
              data={monthlyData}
              dataKey="totalWorkers"
              color="#3b82f6"
            />
            <Chart
              title="Women Participation Trend"
              data={monthlyData}
              dataKey="womenParticipation"
              color="#ec4899"
              unit="%"
            />
            <Chart
              title="Person Days Generated"
              data={monthlyData}
              dataKey="personDays"
              color="#10b981"
            />
            <Chart
              title="SC/ST Participation"
              data={monthlyData}
              dataKey="scstParticipation"
              color="#f59e0b"
              unit="%"
            />
          </>
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg">No chart data available</p>
            <p className="text-sm">Try selecting a different year or syncing latest data</p>
          </div>
        )}
      </div>

      {/* Additional Metrics Section */}
      {currentData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {currentData.scstParticipation}%
              </div>
              <div className="text-blue-600 text-sm mt-1">SC/ST Participation</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {currentData.totalHouseholds.toLocaleString()}
              </div>
              <div className="text-green-600 text-sm mt-1">Households Benefited</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                ₹{Math.round(currentData.totalFunds / 100000).toLocaleString()}L
              </div>
              <div className="text-purple-600 text-sm mt-1">Total Funds Allocated</div>
            </div>
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600 text-sm">
          💡 Data is synced from Government of India MGNREGS API. 
          Last sync: {new Date().toLocaleString()} • 
          <button 
            onClick={refreshData}
            className="text-blue-600 hover:text-blue-800 ml-1 underline"
          >
            Sync now
          </button>
        </p>
      </div>
    </div>
  );
}

// Separate loading component for the page
function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardLoading />
        <CardLoading />
        <CardLoading />
        <CardLoading />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartLoading />
        <ChartLoading />
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

const KPIDashboard = ({ mineId }) => {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadKPI = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMineKPI(mineId);
        setKpi(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setKpi(null);
      } finally {
        setLoading(false);
      }
    };

    if (mineId !== null && mineId !== undefined) {
      loadKPI();
    }
  }, [mineId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#F7F6F4] rounded-lg h-24 animate-pulse border border-[#E4E2DE]"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFF5F5] border border-[#FCE2E2] rounded-lg p-4 text-[#8B7A5E]">
        <p className="font-semibold">Error loading KPI</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!kpi) {
    return <div className="text-[#6B6F76] text-center py-8 font-medium">No KPI data available</div>;
  }

  const metrics = [
    {
      title: 'Total Pixels',
      value: kpi.total_pixels?.toLocaleString() || '0',
      icon: '📊',
      color: 'blue'
    },
    {
      title: 'Excavated Pixels',
      value: `${kpi.excavated_pixels?.toLocaleString() || '0'} (${kpi.excavated_percentage || '0'}%)`,
      icon: '🚜',
      color: 'red'
    },
    {
      title: 'Avg NDVI (Normal)',
      value: kpi.avg_ndvi_normal?.toFixed(3) || '0.00',
      icon: '🌱',
      color: 'green'
    },
    {
      title: 'Avg NDVI (Excavated)',
      value: kpi.avg_ndvi_excavated?.toFixed(3) || '0.00',
      icon: '⚠️',
      color: 'orange'
    },
    {
      title: 'Max Anomaly Score',
      value: kpi.max_anomaly_score?.toFixed(4) || '0.00',
      icon: '🎯',
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'bg-white border-[#E4E2DE] text-[#3A5F7D]',
    red: 'bg-white border-[#E4E2DE] text-[#8B7A5E]',
    green: 'bg-white border-[#E4E2DE] text-[#3A5F7D]',
    orange: 'bg-white border-[#E4E2DE] text-[#8B7A5E]',
    purple: 'bg-white border-[#E4E2DE] text-[#3A5F7D]'
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`${colorClasses[metric.color]} border rounded-lg p-3 transition hover:border-[#BFB9B0]`}
          >
            <div className="text-2xl mb-2">{metric.icon}</div>
            <p className="text-xs uppercase tracking-wide font-medium text-[#6B6F76]">
              {metric.title}
            </p>
            <p className="text-base font-semibold mt-1 text-[#1F2328]">{metric.value}</p>
          </div>
        ))}
      </div>

      {kpi.date_range && (
        <div className="bg-[#F7F6F4] border border-[#E4E2DE] rounded-lg p-3 text-sm text-[#6B6F76]">
          <span className="font-medium">Data Range:</span> {kpi.date_range.start} to {kpi.date_range.end}
        </div>
      )}
    </div>
  );
};

export default KPIDashboard;

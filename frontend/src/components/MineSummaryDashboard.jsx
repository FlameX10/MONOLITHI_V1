import React, { useMemo } from 'react';
import '../styles/KPICards.css';

export function MineSummaryDashboard({ mineData }) {
  const stats = useMemo(() => {
    if (!mineData || mineData.length === 0) return null;

    const totalPixels = mineData.length;
    const anomalousPixels = mineData.filter(p => p.anomaly_label === 1).length;
    const percentAnomalous = ((anomalousPixels / totalPixels) * 100).toFixed(1);

    const normalPixels = mineData.filter(p => p.anomaly_label === -1);
    const excavatedPixels = mineData.filter(p => p.anomaly_label === 1);

    const avgNdviNormal = normalPixels.length > 0
      ? (normalPixels.reduce((sum, p) => sum + p.ndvi, 0) / normalPixels.length).toFixed(3)
      : 'N/A';

    const avgNdviExcavated = excavatedPixels.length > 0
      ? (excavatedPixels.reduce((sum, p) => sum + p.ndvi, 0) / excavatedPixels.length).toFixed(3)
      : 'N/A';

    const maxAnomalyScore = Math.max(...mineData.map(p => p.anomaly_score || 0)).toFixed(3);
    const dateRange = `${mineData[0]?.date || 'N/A'}`;

    return {
      totalPixels,
      anomalousPixels,
      percentAnomalous,
      avgNdviNormal,
      avgNdviExcavated,
      maxAnomalyScore,
      dateRange
    };
  }, [mineData]);

  if (!stats) return <div>No data available</div>;

  return (
    <div className="dashboard-container">
      <h2>Mine Summary Dashboard</h2>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Total Pixels</div>
          <div className="kpi-value">{stats.totalPixels}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Excavated Pixels</div>
          <div className="kpi-value">{stats.anomalousPixels}</div>
          <div className="kpi-subtitle">({stats.percentAnomalous}%)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Avg NDVI (Normal)</div>
          <div className="kpi-value">{stats.avgNdviNormal}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Avg NDVI (Excavated)</div>
          <div className="kpi-value">{stats.avgNdviExcavated}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Max Anomaly Score</div>
          <div className="kpi-value">{stats.maxAnomalyScore}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Date Range</div>
          <div className="kpi-value">{stats.dateRange}</div>
        </div>
      </div>
    </div>
  );
}

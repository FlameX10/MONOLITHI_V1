import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import csvData from '../data/pixel_timeseries (1).csv?raw';

const NDVIvsNBRScatter = ({ mineId }) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Load and process CSV data for the selected mine
  React.useEffect(() => {
    const loadMineData = () => {
      try {
        // Parse CSV from imported data
        Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Filter data for the selected mine
            const mineData = results.data.filter(
              (row) => parseInt(row.mine_id) === parseInt(mineId)
            );

            if (mineData.length > 0) {
              setData(mineData);
            }
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error('Error loading mine data:', error);
        setLoading(false);
      }
    };

    if (mineId !== null && mineId !== undefined) {
      setLoading(true);
      loadMineData();
    }
  }, [mineId]);

  // Process data for scatter plot
  const plotData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Separate data by anomaly type
    const anomalyPresent = [];
    const anomalyAbsent = [];

    data.forEach((point) => {
      const ndvi = parseFloat(point.ndvi);
      const nbr = parseFloat(point.nbr);
      const anomalyScore = parseFloat(point.anomaly_score);
      const anomaly = parseInt(point.anomaly_label);

      if (!isNaN(ndvi) && !isNaN(nbr)) {
        const pointData = {
          x: ndvi,
          y: nbr,
          anomalyScore: anomalyScore,
          anomaly: anomaly,
        };

        if (anomaly === 1) {
          anomalyPresent.push(pointData);
        } else if (anomaly === -1) {
          anomalyAbsent.push(pointData);
        }
      }
    });

    // Create traces for each anomaly type
    const traces = [];

    if (anomalyPresent.length > 0) {
      traces.push({
        name: 'Disturbed Land (Anomaly = 1)',
        x: anomalyPresent.map((d) => d.x),
        y: anomalyPresent.map((d) => d.y),
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: anomalyPresent.map((d) => Math.max(4, d.anomalyScore * 15)),
          color: '#EF4444',
          opacity: 0.7,
          line: {
            color: '#DC2626',
            width: 1,
          },
        },
        text: anomalyPresent.map(
          (d) =>
            `NDVI: ${d.x.toFixed(3)}<br>NBR: ${d.y.toFixed(3)}<br>Anomaly Score: ${d.anomalyScore.toFixed(4)}`
        ),
        hoverinfo: 'text',
      });
    }

    if (anomalyAbsent.length > 0) {
      traces.push({
        name: 'Undisturbed Land (Anomaly = -1)',
        x: anomalyAbsent.map((d) => d.x),
        y: anomalyAbsent.map((d) => d.y),
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: anomalyAbsent.map((d) => Math.max(4, Math.abs(d.anomalyScore) * 15)),
          color: '#22C55E',
          opacity: 0.7,
          line: {
            color: '#16A34A',
            width: 1,
          },
        },
        text: anomalyAbsent.map(
          (d) =>
            `NDVI: ${d.x.toFixed(3)}<br>NBR: ${d.y.toFixed(3)}<br>Anomaly Score: ${d.anomalyScore.toFixed(4)}`
        ),
        hoverinfo: 'text',
      });
    }

    return traces;
  }, [data]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading spectral data...</p>
      </div>
    );
  }

  if (!plotData || plotData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-600">No spectral data available for this mine</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <Plot
        data={plotData}
        layout={{
          title: {
            text: 'NDVI vs NBR Analysis',
            font: { size: 14, family: 'Arial, sans-serif' },
          },
          xaxis: {
            title: {
              text: 'NDVI',
              font: { size: 12, family: 'Arial, sans-serif' },
            },
            gridcolor: '#E5E7EB',
            zeroline: false,
            showgrid: true,
          },
          yaxis: {
            title: {
              text: 'NBR',
              font: { size: 12, family: 'Arial, sans-serif' },
            },
            gridcolor: '#E5E7EB',
            zeroline: false,
            showgrid: true,
          },
          hovermode: 'closest',
          margin: { l: 50, r: 40, t: 40, b: 50 },
          plot_bgcolor: '#F9FAFB',
          paper_bgcolor: '#FFFFFF',
          font: { family: 'Arial, sans-serif' },
          legend: {
            x: 0.02,
            y: 0.98,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: '#D1D5DB',
            borderwidth: 1,
          },
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default NDVIvsNBRScatter;

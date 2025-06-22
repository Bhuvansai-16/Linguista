import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const VisualizationDisplay = ({ visualizationData, task, isVisible }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (!isVisible || !visualizationData) return null;

  const createSentimentChart = () => {
    const data = {
      labels: visualizationData.map(d => d.name),
      datasets: [{
        data: visualizationData.map(d => d.value),
        backgroundColor: [
          'rgba(40, 167, 69, 0.7)',  // Positive - green
          'rgba(173, 181, 189, 0.7)', // Neutral - gray
          'rgba(239, 68, 68, 0.7)'   // Negative - red
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(173, 181, 189, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Sentiment Distribution',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              return `${context.label}: ${(value * 100).toFixed(1)}%`;
            }
          }
        }
      }
    };

    return <Pie ref={chartRef} data={data} options={options} />;
  };

  const createKeywordChart = () => {
    const sortedData = [...visualizationData].sort((a, b) => b.value - a.value);
    const topData = sortedData.slice(0, 10);

    const data = {
      labels: topData.map(d => d.name),
      datasets: [{
        label: 'Relevance Score',
        data: topData.map(d => d.value),
        backgroundColor: 'rgba(98, 69, 255, 0.7)',
        borderColor: 'rgba(98, 69, 255, 1)',
        borderWidth: 1
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Top Keywords',
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    };

    return <Bar ref={chartRef} data={data} options={options} />;
  };

  const createSimilarityChart = () => {
    const data = {
      labels: ['Unique to Text 1', 'Common Terms', 'Unique to Text 2'],
      datasets: [{
        data: [
          visualizationData.text1_unique_count,
          visualizationData.common_terms_count,
          visualizationData.text2_unique_count
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(245, 158, 11, 0.7)'   // Orange
        ],
        borderWidth: 1
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: `Similarity Score: ${(visualizationData.similarity_score * 100).toFixed(1)}%`,
        }
      }
    };

    return <Pie ref={chartRef} data={data} options={options} />;
  };

  const renderVisualization = () => {
    switch (task) {
      case 'sentiment_analysis':
        return createSentimentChart();
      case 'keyword_extraction':
        return createKeywordChart();
      case 'text_similarity':
        return createSimilarityChart();
      default:
        return null;
    }
  };

  const visualization = renderVisualization();

  if (!visualization) return null;

  return (
    <div className="card border-0 shadow-sm mb-4 visualization-container">
      <div className="card-header bg-transparent border-bottom">
        <h3 className="fs-5 mb-0">
          <i className="bi bi-graph-up me-2"></i>Visualization
        </h3>
      </div>
      <div className="card-body chart-container">
        {visualization}
      </div>
    </div>
  );
};

export default VisualizationDisplay;
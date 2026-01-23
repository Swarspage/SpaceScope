import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TempAnomalyChart = ({ onDataLoaded }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://global-warming.org/api/temperature-api');
                // API returns { result: [ { "time": "1880.04", "station": "-0.29" }, ... ] }
                const data = response.data.result;

                // Process data
                const labels = [];
                const values = [];
                const backgroundColors = [];

                data.forEach(item => {
                    const year = parseInt(item.time);
                    const anomaly = parseFloat(item.station);

                    labels.push(year);
                    values.push(anomaly);

                    // Strict Coloring Logic
                    if (anomaly >= 0) {
                        backgroundColors.push('rgba(255, 99, 132, 0.8)'); // Red
                    } else {
                        backgroundColors.push('rgba(54, 162, 235, 0.8)'); // Blue
                    }
                });

                if (values.length > 0 && onDataLoaded) {
                    onDataLoaded(values[values.length - 1]);
                }

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Temperature Anomaly (°C)',
                            data: values,
                            data: values,
                            backgroundColor: backgroundColors,
                            borderRadius: 0,
                            borderWidth: 0,
                            barPercentage: 1.0,
                            categoryPercentage: 1.0,
                        },
                    ],
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch temperature data:", err);
                setError("Failed to load temperature anomaly data.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Hide legend since color explains it
            },
            title: {
                display: true,
                text: 'Global Temperature Deviation (1880-2024)',
                color: '#f8fafc',
                font: {
                    family: "'Inter', sans-serif",
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    title: (tooltipItems) => `Year: ${tooltipItems[0].label}`,
                    label: (context) => `Deviation: ${context.raw}°C`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false, // Hide grid lines
                },
                ticks: {
                    color: '#94a3b8',
                    maxTicksLimit: 20,
                },
                title: {
                    display: true,
                    text: 'Year',
                    color: '#64748b'
                }
            },
            y: {
                grid: {
                    color: (context) => context.tick.value === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                    lineWidth: (context) => context.tick.value === 0 ? 2 : 1,
                },
                ticks: {
                    color: '#94a3b8',
                },
                title: {
                    display: true,
                    text: 'Deviation (°C)',
                    color: '#64748b'
                }
            },
        },
        animation: {
            duration: 800,
            easing: 'easeOutQuart'
        }
    }), []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[#00ff88]">
                <Loader2 className="animate-spin h-8 w-8 mb-2" />
                <span className="text-sm font-mono tracking-wider">LOADING DATA...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
                <AlertTriangle className="h-10 w-10 mb-2" />
                <h3 className="text-lg font-bold">Data Unavailable</h3>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#0a0e17] p-4 rounded-xl">
            {chartData && <Bar data={chartData} options={options} />}
        </div>
    );
};

export default React.memo(TempAnomalyChart);

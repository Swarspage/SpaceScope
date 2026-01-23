import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const CO2Chart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://global-warming.org/api/co2-api');
                const data = response.data.co2;

                // Filter data for years 2016-2026
                const filteredData = data.filter(item => {
                    const year = parseInt(item.year);
                    return year >= 2016 && year <= 2026;
                });

                // Process data for Chart.js
                // We'll use a subset of data points to avoid overcrowding the chart if needed,
                // but for < 4000 points (10 years * 365 days), canvas can handle it.
                // Let's perform a light downsampling if the dataset is huge, 
                // effectively taking 10 years of daily data is fine for modern devices.

                const labels = filteredData.map(item => `${item.year}-${item.month}-${item.day}`);
                const cycles = filteredData.map(item => parseFloat(item.cycle));
                const trends = filteredData.map(item => parseFloat(item.trend));

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'CO₂ Cycle (ppm)',
                            data: cycles,
                            borderColor: 'rgba(0, 255, 136, 1)',
                            backgroundColor: 'rgba(0, 255, 136, 0.2)',
                            borderWidth: 1.5,
                            pointRadius: 0, // Hide points for cleaner look on large datasets
                            pointHoverRadius: 4,
                            tension: 0.4,
                            fill: true,
                        },
                        {
                            label: 'CO₂ Trend (ppm)',
                            data: trends,
                            borderColor: 'rgba(56, 189, 248, 1)', // Light Blue
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            tension: 0.4,
                            borderDash: [5, 5],
                        },
                    ],
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch CO2 data:", err);
                setError("Failed to load CO2 concentration data.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#cbd5e1', // slate-300
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    usePointStyle: true,
                },
            },
            title: {
                display: true,
                text: 'Global CO₂ Concentration (2016 - Present)',
                color: '#f8fafc', // slate-50
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
                backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                displayColors: true,
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8', // slate-400
                    maxTicksLimit: 12,
                    maxRotation: 0,
                },
                title: {
                    display: true,
                    text: 'Year',
                    color: '#64748b'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                },
                title: {
                    display: true,
                    text: 'Concentration (ppm)',
                    color: '#64748b'
                },
                suggestedMin: 400, // Based on data sample provided
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        }
    }), []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[#00ff88]">
                <Loader2 className="animate-spin h-8 w-8 mb-2" />
                <span className="text-sm font-mono tracking-wider">LOADING CO₂ DATA...</span>
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
            {chartData && <Line data={chartData} options={options} />}
        </div>
    );
};

export default React.memo(CO2Chart);

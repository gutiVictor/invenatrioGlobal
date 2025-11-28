import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#FBBF24', // Yellow  
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6'  // Teal
];

const DoughnutChart = ({ data, title }) => {
    // Check if we have data
    if (!data || !data.labels || !data.values || data.labels.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-sm text-gray-500 text-center py-8">No hay datos para mostrar</p>
            </div>
        );
    }

    // Transform data for Recharts
    const chartData = data.labels.map((label, index) => ({
        name: label,
        value: data.values[index]
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const total = chartData.reduce((sum, item) => sum + item.value, 0);
            const percentage = ((payload[0].value / total) * 100).toFixed(1);
            return (
                <div className="bg-white px-3 py-2 shadow-lg rounded border border-gray-200">
                    <p className="text-sm font-semibold">{payload[0].name}</p>
                    <p className="text-sm text-gray-600">
                        {payload[0].value} ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DoughnutChart;

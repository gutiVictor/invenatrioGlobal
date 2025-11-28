import React from 'react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, title }) => {
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
        cantidad: data.values[index]
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-3 py-2 shadow-lg rounded border border-gray-200">
                    <p className="text-sm font-semibold">{payload[0].payload.name}</p>
                    <p className="text-sm text-gray-600">
                        Cantidad: {payload[0].value}
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
                    <RechartsBar data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="cantidad"
                            fill="#3B82F6"
                            radius={[8, 8, 0, 0]}
                        />
                    </RechartsBar>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BarChart;

import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-secondary-500">{title}</p>
                <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
                <span className="ml-2 text-secondary-400">vs mes anterior</span>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    // Datos de ejemplo (luego vendrán de la API)
    const stats = [
        {
            title: 'Total Productos',
            value: '1,234',
            icon: Package,
            color: 'bg-blue-500',
            trend: 12.5
        },
        {
            title: 'Valor Inventario',
            value: '$45,231',
            icon: DollarSign,
            color: 'bg-green-500',
            trend: 8.2
        },
        {
            title: 'Stock Bajo',
            value: '23',
            icon: AlertTriangle,
            color: 'bg-orange-500',
            trend: -5.4
        },
        {
            title: 'Movimientos Mes',
            value: '456',
            icon: TrendingUp,
            color: 'bg-purple-500',
            trend: 15.3
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900">Dashboard</h2>
                <p className="text-secondary-500">Resumen general del inventario</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-secondary-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-secondary-900">Entrada de Producto</p>
                                        <p className="text-xs text-secondary-500">Hace 2 horas</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-green-600">+50 un</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Productos Más Vendidos</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-secondary-100"></div>
                                    <div>
                                        <p className="text-sm font-medium text-secondary-900">Producto Ejemplo {i}</p>
                                        <p className="text-xs text-secondary-500">SKU-00{i}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-secondary-900">$1,200</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

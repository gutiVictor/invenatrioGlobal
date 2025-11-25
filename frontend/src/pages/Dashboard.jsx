import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Wrench, TrendingUp, Warehouse, Laptop } from 'lucide-react';
import api from '../services/api';

const KPICard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="card hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-secondary-500">{title}</p>
                {loading ? (
                    <div className="mt-2 h-8 w-20 bg-secondary-200 animate-pulse rounded"></div>
                ) : (
                    <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [equiposPorCategoria, setEquiposPorCategoria] = useState([]);
    const [equiposPorAlmacen, setEquiposPorAlmacen] = useState([]);
    const [stockBajo, setStockBajo] = useState([]);
    const [mantenimientos, setMantenimientos] = useState([]);
    const [ultimasEntradas, setUltimasEntradas] = useState([]);
    const [ultimasAsignaciones, setUltimasAsignaciones] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all dashboard data in parallel
            const [
                summaryRes,
                categoriaRes,
                almacenRes,
                stockBajoRes,
                mantenimientosRes,
                entradasRes,
                asignacionesRes
            ] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/dashboard/equipos-por-categoria'),
                api.get('/dashboard/equipos-por-almacen'),
                api.get('/dashboard/stock-bajo'),
                api.get('/dashboard/mantenimientos-proximos'),
                api.get('/dashboard/ultimas-entradas'),
                api.get('/dashboard/ultimas-asignaciones')
            ]);

            if (summaryRes.data.success) setSummary(summaryRes.data.data);
            if (categoriaRes.data.success) setEquiposPorCategoria(categoriaRes.data.data);
            if (almacenRes.data.success) setEquiposPorAlmacen(almacenRes.data.data);
            if (stockBajoRes.data.success) setStockBajo(stockBajoRes.data.data);
            if (mantenimientosRes.data.success) setMantenimientos(mantenimientosRes.data.data);
            if (entradasRes.data.success) setUltimasEntradas(entradasRes.data.data);
            if (asignacionesRes.data.success) setUltimasAsignaciones(asignacionesRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900">Dashboard de Control de Activos IT</h2>
                <p className="text-secondary-500">Resumen general del inventario de equipos</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total de Equipos"
                    value={summary?.total_equipos || 0}
                    icon={Package}
                    color="bg-blue-500"
                    loading={loading}
                />
                <KPICard
                    title="Equipos Disponibles"
                    value={summary?.equipos_disponibles || 0}
                    icon={Laptop}
                    color="bg-green-500"
                    loading={loading}
                />
                <KPICard
                    title="Stock Bajo"
                    value={summary?.stock_bajo || 0}
                    icon={AlertTriangle}
                    color="bg-orange-500"
                    loading={loading}
                />
                <KPICard
                    title="Mantenimientos Próximos"
                    value={summary?.mantenimientos_proximos || 0}
                    icon={Wrench}
                    color="bg-purple-500"
                    loading={loading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipos por Categoría */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Equipos por Categoría</h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 bg-secondary-200 animate-pulse rounded"></div>
                            ))}
                        </div>
                    ) : equiposPorCategoria.length > 0 ? (
                        <div className="space-y-3">
                            {equiposPorCategoria.map((cat, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-secondary-700">{cat.categoria}</span>
                                            <span className="text-sm font-bold text-secondary-900">{cat.cantidad}</span>
                                        </div>
                                        <div className="w-full bg-secondary-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${(cat.cantidad / Math.max(...equiposPorCategoria.map(c => c.cantidad))) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-secondary-500 text-center py-8">No hay datos disponibles</p>
                    )}
                </div>

                {/* Equipos por Almacén */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Equipos por Almacén</h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 bg-secondary-200 animate-pulse rounded"></div>
                            ))}
                        </div>
                    ) : equiposPorAlmacen.length > 0 ? (
                        <div className="space-y-3">
                            {equiposPorAlmacen.map((alm, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <Warehouse className="h-5 w-5 text-secondary-400" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-secondary-700">{alm.almacen}</span>
                                            <span className="text-sm font-bold text-secondary-900">{alm.cantidad}</span>
                                        </div>
                                        <div className="w-full bg-secondary-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${(alm.cantidad / Math.max(...equiposPorAlmacen.map(a => a.cantidad))) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-secondary-500 text-center py-8">No hay datos disponibles</p>
                    )}
                </div>
            </div>

            {/* Últimas Entradas y Asignaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Últimas Entradas */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Últimas Entradas</h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-secondary-200 animate-pulse rounded"></div>
                            ))}
                        </div>
                    ) : ultimasEntradas.length > 0 ? (
                        <div className="space-y-3">
                            {ultimasEntradas.map((entrada) => (
                                <div key={entrada.id} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-secondary-900">{entrada.producto}</p>
                                            <p className="text-xs text-secondary-500">{entrada.almacen} • {formatDate(entrada.fecha)}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-green-600">+{entrada.cantidad}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-secondary-500 text-center py-8">No hay entradas recientes</p>
                    )}
                </div>

                {/* Últimas Asignaciones */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Últimas Asignaciones</h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-secondary-200 animate-pulse rounded"></div>
                            ))}
                        </div>
                    ) : ultimasAsignaciones.length > 0 ? (
                        <div className="space-y-3">
                            {ultimasAsignaciones.map((asignacion) => (
                                <div key={asignacion.id} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-secondary-900">{asignacion.producto}</p>
                                            <p className="text-xs text-secondary-500">{asignacion.referencia} • {formatDate(asignacion.fecha)}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">-{asignacion.cantidad}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-secondary-500 text-center py-8">No hay asignaciones recientes</p>
                    )}
                </div>
            </div>

            {/* Alertas */}
            {(stockBajo.length > 0 || mantenimientos.length > 0) && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Alertas
                    </h3>

                    {/* Stock Bajo */}
                    {stockBajo.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-secondary-700 mb-2">⚠️ Productos con Stock Bajo</h4>
                            <div className="space-y-2">
                                {stockBajo.map((producto) => (
                                    <div key={producto.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-secondary-900">{producto.producto}</p>
                                            <p className="text-xs text-secondary-500">SKU: {producto.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-orange-600">{producto.stock_actual} / {producto.stock_min}</p>
                                            <p className="text-xs text-secondary-500">Faltan {producto.diferencia}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mantenimientos Próximos */}
                    {mantenimientos.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-secondary-700 mb-2">🔧 Mantenimientos Próximos (30 días)</h4>
                            <div className="space-y-2">
                                {mantenimientos.map((mant) => (
                                    <div key={mant.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-secondary-900">{mant.producto}</p>
                                            <p className="text-xs text-secondary-500">S/N: {mant.serial_number}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-purple-600">{mant.dias_restantes} días</p>
                                            <p className="text-xs text-secondary-500">{new Date(mant.proximo_mantenimiento).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;

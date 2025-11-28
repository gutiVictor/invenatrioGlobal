import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Wrench, TrendingUp, Warehouse, Laptop, Clock, Shield, Settings } from 'lucide-react';
import api from '../services/api';

import { useNavigate } from 'react-router-dom';
import DoughnutChart from '../components/Dashboard/DoughnutChart';
import BarChart from '../components/Dashboard/BarChart';

const KPICard = ({ title, value, icon: Icon, color, loading, onClick }) => (
    <div
        className={`card hover:shadow-md transition-shadow duration-200 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
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
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [equiposPorCategoria, setEquiposPorCategoria] = useState([]);
    const [equiposPorAlmacen, setEquiposPorAlmacen] = useState([]);
    const [equiposPorEstado, setEquiposPorEstado] = useState([]);
    const [valorInventario, setValorInventario] = useState([]);

    // Nuevas alertas para activos IT
    const [equiposMantenimiento, setEquiposMantenimiento] = useState([]);
    const [garantiasVencer, setGarantiasVencer] = useState([]);
    const [equiposReparacion, setEquiposReparacion] = useState([]);
    const [asignacionesVencidas, setAsignacionesVencidas] = useState([]);

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
                estadoRes,
                valorRes,
                mantenimientoRes,
                garantiasRes,
                reparacionRes,
                asignacionesVencidasRes,
                entradasRes,
                asignacionesRes
            ] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/dashboard/equipos-por-categoria'),
                api.get('/dashboard/equipos-por-almacen'),
                api.get('/dashboard/equipos-por-estado'),
                api.get('/dashboard/valor-inventario'),
                api.get('/dashboard/equipos-mantenimiento-proximo'),
                api.get('/dashboard/garantias-por-vencer'),
                api.get('/dashboard/equipos-reparacion-prolongada'),
                api.get('/dashboard/asignaciones-vencidas'),
                api.get('/dashboard/ultimas-entradas'),
                api.get('/dashboard/ultimas-asignaciones')
            ]);

            if (summaryRes.data.success) setSummary(summaryRes.data.data);
            if (categoriaRes.data.success) setEquiposPorCategoria(categoriaRes.data.data);
            if (almacenRes.data.success) setEquiposPorAlmacen(almacenRes.data.data);
            if (estadoRes.data.success) setEquiposPorEstado(estadoRes.data.data);
            if (valorRes.data.success) setValorInventario(valorRes.data.data);
            if (mantenimientoRes.data.success) setEquiposMantenimiento(mantenimientoRes.data.data);
            if (garantiasRes.data.success) setGarantiasVencer(garantiasRes.data.data);
            if (reparacionRes.data.success) setEquiposReparacion(reparacionRes.data.data);
            if (asignacionesVencidasRes.data.success) setAsignacionesVencidas(asignacionesVencidasRes.data.data);
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
            year: 'numeric'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const getStatusLabel = (status) => {
        const labels = {
            'in_use': 'En Uso',
            'in_stock': 'Disponible',
            'under_repair': 'En Reparación',
            'retired': 'Retirado',
            'stolen': 'Robado',
            'disposed': 'Desechado'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'in_use': 'bg-blue-500',
            'in_stock': 'bg-green-500',
            'under_repair': 'bg-orange-500',
            'retired': 'bg-gray-500',
            'stolen': 'bg-red-500',
            'disposed': 'bg-gray-400'
        };
        return colors[status] || 'bg-gray-500';
    };

    // Calcular equipos en uso desde equiposPorEstado
    const equiposEnUso = equiposPorEstado.find(e => e.estado === 'in_use')?.cantidad || 0;
    const equiposEnReparacion = equiposPorEstado.find(e => e.estado === 'under_repair')?.cantidad || 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900">Dashboard de Control de Activos IT</h2>
                <p className="text-secondary-500">Gestión y seguimiento de equipos de cómputo y oficina</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total de Equipos"
                    value={summary?.total_equipos || 0}
                    icon={Package}
                    color="bg-blue-500"
                    loading={loading}
                    onClick={() => navigate('/assets')}
                />
                <KPICard
                    title="Equipos en Uso"
                    value={equiposEnUso}
                    icon={Laptop}
                    color="bg-green-500"
                    loading={loading}
                    onClick={() => navigate('/assets?status=in_use')}
                />
                <KPICard
                    title="En Reparación"
                    value={equiposEnReparacion}
                    icon={Settings}
                    color="bg-orange-500"
                    loading={loading}
                    onClick={() => navigate('/assets?status=under_repair')}
                />
                <KPICard
                    title="Mantenimientos Próximos"
                    value={equiposMantenimiento.length}
                    icon={Wrench}
                    color="bg-purple-500"
                    loading={loading}
                    // For now, just go to assets, as we don't have a maintenance filter yet
                    onClick={() => navigate('/assets')}
                />
            </div>

            {/* Charts Row - With Visual Graphics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipos por Categoría - Gráfica de Barras */}
                {loading ? (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Equipos por Categoría</h3>
                        <div className="h-64 bg-secondary-200 animate-pulse rounded"></div>
                    </div>
                ) : equiposPorCategoria.length > 0 ? (
                    <BarChart
                        title="Equipos por Categoría"
                        data={{
                            labels: equiposPorCategoria.map(cat => cat.categoria),
                            values: equiposPorCategoria.map(cat => cat.cantidad)
                        }}
                    />
                ) : (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Equipos por Categoría</h3>
                        <p className="text-sm text-secondary-500 text-center py-8">No hay datos disponibles</p>
                    </div>
                )}

                {/* Equipos por Estado - Gráfica de Dona */}
                {loading ? (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Equipos por Estado</h3>
                        <div className="h-64 bg-secondary-200 animate-pulse rounded"></div>
                    </div>
                ) : equiposPorEstado.length > 0 ? (
                    <DoughnutChart
                        title="Equipos por Estado"
                        data={{
                            labels: equiposPorEstado.map(estado => getStatusLabel(estado.estado)),
                            values: equiposPorEstado.map(estado => estado.cantidad)
                        }}
                    />
                ) : (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Equipos por Estado</h3>
                        <p className="text-sm text-secondary-500 text-center py-8">No hay datos disponibles</p>
                    </div>
                )}
            </div>

            {/* Valor del Inventario */}
            {valorInventario.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">💰 Valor Total del Inventario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {valorInventario.map((item, idx) => (
                            <div key={idx} className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`h-3 w-3 rounded-full ${getStatusColor(item.estado)}`}></div>
                                    <span className="text-sm font-medium text-secondary-700">{getStatusLabel(item.estado)}</span>
                                </div>
                                <p className="text-2xl font-bold text-secondary-900">{formatCurrency(item.valor_total)}</p>
                                <p className="text-xs text-secondary-500 mt-1">{item.cantidad} equipos</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alertas de Activos IT */}
            {(equiposMantenimiento.length > 0 || garantiasVencer.length > 0 || equiposReparacion.length > 0 || asignacionesVencidas.length > 0) && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Alertas de Activos IT
                    </h3>

                    {/* Mantenimientos Próximos */}
                    {equiposMantenimiento.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-secondary-700 mb-2 flex items-center gap-2">
                                <Wrench className="h-4 w-4 text-purple-600" />
                                Mantenimientos Próximos (30 días)
                            </h4>
                            <div className="space-y-2">
                                {equiposMantenimiento.map((equipo) => (
                                    <div key={equipo.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-secondary-900">{equipo.producto}</p>
                                            <p className="text-xs text-secondary-500">S/N: {equipo.serial_number} • {equipo.tipo_mantenimiento}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-purple-600">{equipo.dias_restantes} días</p>
                                            <p className="text-xs text-secondary-500">{formatDate(equipo.fecha_programada)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Garantías por Vencer */}
                    {garantiasVencer.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-secondary-700 mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-red-600" />
                                Garantías por Vencer (60 días)
                            </h4>
                            <div className="space-y-2">
                                {garantiasVencer.map((equipo) => (
                                    <div key={equipo.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-secondary-900">{equipo.producto}</p>
                                            <p className="text-xs text-secondary-500">S/N: {equipo.serial_number} • Valor: {formatCurrency(equipo.valor)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-red-600">{equipo.dias_restantes} días</p>
                                            <p className="text-xs text-secondary-500">{formatDate(equipo.fecha_vencimiento)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Equipos en Reparación Prolongada */}
                    {equiposReparacion.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-secondary-700 mb-2 flex items-center gap-2">
                                <Settings className="h-4 w-4 text-orange-600" />
                                Equipos en Reparación Prolongada (&gt;15 días)
                            </h4>
                            <div className="space-y-2">
                                {equiposReparacion.map((equipo) => (
                                    <div key={equipo.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-secondary-900">{equipo.producto}</p>
                                            <p className="text-xs text-secondary-500">S/N: {equipo.serial_number} • {equipo.ubicacion || 'Sin ubicación'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-orange-600">{equipo.dias_en_reparacion} días</p>
                                            <p className="text-xs text-secondary-500">En reparación</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Asignaciones Vencidas */}
                    {asignacionesVencidas.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-secondary-700 mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                Asignaciones Vencidas
                            </h4>
                            <div className="space-y-2">
                                {asignacionesVencidas.map((asignacion) => (
                                    <div key={asignacion.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-secondary-900">{asignacion.producto}</p>
                                            <p className="text-xs text-secondary-500">
                                                Asignado a: {asignacion.asignado_a} • {asignacion.departamento || 'Sin departamento'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-blue-600">{asignacion.dias_retraso} días</p>
                                            <p className="text-xs text-secondary-500">de retraso</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

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
        </div>
    );
};

export default Dashboard;

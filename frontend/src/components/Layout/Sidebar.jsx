import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    Warehouse,
    ArrowLeftRight,
    Settings,
    LogOut,
    X,
    Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Productos', path: '/products' },
        { icon: Tags, label: 'Categorías', path: '/categories' },
        { icon: Monitor, label: 'Activos IT', path: '/assets' },
        { icon: Warehouse, label: 'Almacenes', path: '/warehouses' },
        { icon: ArrowLeftRight, label: 'Movimientos', path: '/movements' },
        { icon: Settings, label: 'Configuración', path: '/settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-secondary-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-secondary-200 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-secondary-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-600 p-1.5 rounded-lg">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-secondary-900 tracking-tight">Inventario</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 rounded-md hover:bg-secondary-100 text-secondary-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Menú */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.path)
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'}
                `}
                            >
                                <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-primary-600' : 'text-secondary-400'}`} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer Sidebar */}
                    <div className="p-4 border-t border-secondary-100">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

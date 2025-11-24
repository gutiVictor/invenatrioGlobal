import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-secondary-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-600 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-semibold text-secondary-800 hidden sm:block">
                    Sistema de Inventario Global
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-secondary-100 text-secondary-500 relative transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-secondary-200 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-secondary-900">{user?.name || 'Usuario'}</p>
                        <p className="text-xs text-secondary-500 capitalize">{user?.role || 'Rol'}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm">
                        <User className="h-5 w-5 text-primary-600" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;

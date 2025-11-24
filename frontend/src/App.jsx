import AssetList from './pages/Assets/AssetList';
import AssetCreate from './pages/Assets/AssetCreate';
import AssetEdit from './pages/Assets/AssetEdit';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import CategoryList from './pages/Categories/CategoryList';
import CategoryForm from './pages/Categories/CategoryForm';
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierForm from './pages/Suppliers/SupplierForm';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/edit/:id" element={<ProductForm />} />
                        <Route path="categories" element={<CategoryList />} />
                        <Route path="categories/new" element={<CategoryForm />} />
                        <Route path="categories/edit/:id" element={<CategoryForm />} />

                        {/* Rutas de Proveedores */}
                        <Route path="suppliers" element={<SupplierList />} />
                        <Route path="suppliers/new" element={<SupplierForm />} />
                        <Route path="suppliers/edit/:id" element={<SupplierForm />} />

                        {/* Rutas de Activos */}
                        <Route path="assets" element={<AssetList />} />
                        <Route path="assets/new" element={<AssetCreate />} />
                        <Route path="assets/:id/edit" element={<AssetEdit />} />

                        <Route path="warehouses" element={<div>Página de Almacenes (En construcción)</div>} />
                        <Route path="movements" element={<div>Página de Movimientos (En construcción)</div>} />
                        <Route path="settings" element={<div>Página de Configuración (En construcción)</div>} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import CategoryTable from '../../components/Categories/CategoryTable';
import api from '../../services/api';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        navigate(`/categories/edit/${category.id}`);
    };

    const handleDelete = async (category) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await api.delete(`/categories/${category.id}`);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Categorías</h2>
                    <p className="text-secondary-500">Gestiona las categorías de tus productos</p>
                </div>
                <Link to="/categories/new" className="btn-primary">
                    <Plus className="h-5 w-5" />
                    Nueva Categoría
                </Link>
            </div>

            <div className="card p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-secondary-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar categorías..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredCategories.length > 0 ? (
                    <CategoryTable
                        categories={filteredCategories}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-secondary-500">No se encontraron categorías</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryList;

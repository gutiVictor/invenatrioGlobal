import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AssetTable from '../../components/Assets/AssetTable';
import AssignmentModal from '../../components/Assets/AssignmentModal';
import assetService from '../../services/assetService';

const AssetList = () => {
    const [searchParams] = useSearchParams();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [conditionFilter, setConditionFilter] = useState(searchParams.get('condition') || '');

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const response = await assetService.getAssets();
            if (response.success) {
                setAssets(response.data.assets);
            }
        } catch (err) {
            setError('Error al cargar los activos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este activo?')) {
            try {
                await assetService.deleteAsset(id);
                fetchAssets();
            } catch (err) {
                alert('Error al eliminar el activo');
            }
        }
    };

    const handleOpenAssignModal = (asset) => {
        setSelectedAsset(asset);
        setSelectedAssignment(null);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleAssign = async (id, data) => {
        try {
            await assetService.assignAsset(id, data);
            setIsModalOpen(false);
            fetchAssets();
            alert('Activo asignado correctamente');
        } catch (err) {
            alert('Error al asignar el activo');
        }
    };

    const handleOpenEditModal = (asset) => {
        const activeAssignment = asset.assignments?.find(a => a.status === 'active');
        if (activeAssignment) {
            setSelectedAsset(asset);
            setSelectedAssignment(activeAssignment);
            setIsEditMode(true);
            setIsModalOpen(true);
        }
    };

    const handleUpdateAssignment = async (assignmentId, data) => {
        try {
            await assetService.updateAssignment(assignmentId, data);
            setIsModalOpen(false);
            fetchAssets();
            alert('Asignación actualizada correctamente');
        } catch (err) {
            alert('Error al actualizar la asignación');
        }
    };

    const handleReturn = async (asset) => {
        if (window.confirm(`¿Confirmar devolución del activo ${asset.serial_number}?`)) {
            try {
                await assetService.returnAsset(asset.id, { condition_on_return: asset.condition });
                fetchAssets();
                alert('Activo devuelto correctamente');
            } catch (err) {
                alert('Error al devolver el activo');
            }
        }
    };

    // Filter logic
    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.Product?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter ? asset.status === statusFilter : true;
        const matchesCondition = conditionFilter ? asset.condition === conditionFilter : true;

        return matchesSearch && matchesStatus && matchesCondition;
    });

    if (loading) return <div className="p-4">Cargando...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Activos de TI</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Lista completa de equipos, asignaciones y estado del inventario.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link
                        to="/assets/new"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Nuevo Activo
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 bg-white p-4 rounded-lg shadow">
                <div className="sm:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Buscar</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Serial, Tag o Modelo"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                    <div className="mt-1">
                        <select
                            id="status"
                            name="status"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="in_stock">En Stock</option>
                            <option value="in_use">En Uso</option>
                            <option value="under_repair">En Reparación</option>
                            <option value="retired">Retirado</option>
                            <option value="stolen">Robado</option>
                            <option value="disposed">Desechado</option>
                        </select>
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condición</label>
                    <div className="mt-1">
                        <select
                            id="condition"
                            name="condition"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={conditionFilter}
                            onChange={(e) => setConditionFilter(e.target.value)}
                        >
                            <option value="">Todas</option>
                            <option value="new">Nuevo</option>
                            <option value="good">Bueno</option>
                            <option value="fair">Regular</option>
                            <option value="poor">Malo</option>
                            <option value="broken">Roto</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <AssetTable
                                assets={filteredAssets}
                                onDelete={handleDelete}
                                onAssign={handleOpenAssignModal}
                                onEditAssignment={handleOpenEditModal}
                                onReturn={handleReturn}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AssignmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAssign={handleAssign}
                onUpdate={handleUpdateAssignment}
                asset={selectedAsset}
                assignment={selectedAssignment}
                isEditMode={isEditMode}
            />
        </div>
    );
};

export default AssetList;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AssetTable from '../../components/Assets/AssetTable';
import AssignmentModal from '../../components/Assets/AssignmentModal';
import assetService from '../../services/assetService';

const AssetList = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

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

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <AssetTable
                                assets={assets}
                                onDelete={handleDelete}
                                onAssign={handleOpenAssignModal}
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
                asset={selectedAsset}
            />
        </div>
    );
};

export default AssetList;

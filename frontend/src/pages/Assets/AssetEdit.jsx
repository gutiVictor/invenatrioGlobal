import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssetForm from '../../components/Assets/AssetForm';
import assetService from '../../services/assetService';

const AssetEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await assetService.getAssetById(id);
                if (response.success) {
                    setAsset(response.data);
                }
            } catch (error) {
                console.error('Error loading asset:', error);
                alert('Error al cargar el activo');
                navigate('/assets');
            } finally {
                setLoading(false);
            }
        };

        fetchAsset();
    }, [id, navigate]);

    const handleSubmit = async (data) => {
        try {
            await assetService.updateAsset(id, data);
            alert('Activo actualizado exitosamente');
            navigate('/assets');
        } catch (error) {
            console.error('Error updating asset:', error);
            alert('Error al actualizar el activo');
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar Activo</h1>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <AssetForm initialData={asset} onSubmit={handleSubmit} isEdit={true} />
                </div>
            </div>
        </div>
    );
};

export default AssetEdit;

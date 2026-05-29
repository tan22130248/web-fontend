import React from 'react';
import { useNavigate } from 'react-router-dom';
import SellerProductForm from './SellerProductForm';
import sellerProductService from '../../../services/selllerService';

export default function SellerProductCreate() {
    const navigate = useNavigate();

    const handleCreateProduct = async (payload) => {
        try {
            await sellerProductService.createProduct(payload);
            alert("Đăng sản phẩm thành công!");
            navigate('/seller/products');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    return (
        <SellerProductForm
            product={null}
            onSave={handleCreateProduct}
            onCancel={() => navigate('/seller/products')}
        />
    );
}
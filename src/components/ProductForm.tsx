// src/components/ProductForm.tsx
import React, { useState } from 'react';

interface ProductFormProps {
    categoryId: string; // ID de la categoría a la que se agregará el producto
    onProductCreated: (product: { productName: string; price: number; description: string; productId: string; createdAt: string; }) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ categoryId, onProductCreated }) => {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (price === '') {
            alert('Price is required');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/category/${categoryId}/product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ productName, price, description }),
            });

            if (response.ok) {
                const data = await response.json();
                onProductCreated(data.product); // Pasar el producto creado al padre
                setProductName('');
                setPrice('');
                setDescription('');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product Name"
                required
            />
            <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="Price"
                required
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
            />
            <button type="submit">Add Product</button>
        </form>
    );
};

export default ProductForm;

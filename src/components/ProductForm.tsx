import React, { useState } from 'react';

interface ProductFormProps {
    userId: string;
    categoryId: string;
    onProductCreated: (product: { productName: string; productId: string; price: number; description: string; }, categoryId: string) => void; // Asegúrate de que la firma incluya categoryId
}

const ProductForm: React.FC<ProductFormProps> = ({ userId, categoryId, onProductCreated }) => {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const token = localStorage.getItem('token');

        const productData = {
            userId,
            categoryId,
            productName,
            price,
            description,
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/category/${categoryId}/product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                const data = await response.json();
                onProductCreated({ productName, productId: data.productId, price, description }, categoryId); // Pasar categoryId
                setProductName('');
                setPrice(0);
                setDescription('');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
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
            />
            <button type="submit">Add Product</button>
        </form>
    );
};

export default ProductForm;

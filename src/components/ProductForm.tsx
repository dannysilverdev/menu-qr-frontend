// src/components/ProductForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface NewProduct {
    productName: string;
    price: number;
    description: string;
    productId: string;
    createdAt: string;
    isActive: boolean;
}

interface ProductFormProps {
    categoryId: string;
    onProductCreated: (product: NewProduct) => void;
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
                body: JSON.stringify({
                    productName,
                    price,
                    description,
                    isActive: true // Agregamos isActive al crear el producto
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Aseguramos que el producto tenga todos los campos necesarios
                const newProduct: NewProduct = {
                    ...data.product,
                    isActive: true // Aseguramos que isActive esté presente
                };
                onProductCreated(newProduct);
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
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
                Add New Product
            </Typography>
            <TextField
                label="Product Name"
                variant="outlined"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                fullWidth
            />
            <TextField
                label="Price"
                type="number"
                variant="outlined"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                fullWidth
            />
            <TextField
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                fullWidth
            />
            <Button variant="contained" type="submit" color="primary" startIcon={<AddIcon />} fullWidth>
                Add Product
            </Button>
        </Box>
    );
};

export default ProductForm;
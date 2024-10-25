import React, { useState, useEffect } from 'react';

interface MenuFormProps {
    userId: string; // Definir el tipo para userId
    authToken: string; // Definir el tipo para authToken
}

const MenuForm: React.FC<MenuFormProps> = ({ userId, authToken }) => {
    const [categoryName, setCategoryName] = useState<string>('');
    const [productName, setProductName] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>(''); // ID de categoría para agregar productos
    const [categories, setCategories] = useState<{ SK: string; categoryName: string }[]>([]); // Array para almacenar categorías

    const apiUrl = import.meta.env.VITE_API_URL;


    // Función para cargar categorías del usuario
    const fetchCategories = async () => {
        if (!userId) {
            console.error('User ID is undefined');
            return; // No continuar si userId es undefined
        }

        const response = await fetch(`${apiUrl}/categories/${userId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        })

        if (response.ok) {
            const data = await response.json();
            setCategories(data.categories); // Supón que tienes un array de categorías
        } else {
            console.error('Error fetching categories:', response.statusText);
        }
    };

    // Cargar categorías del usuario al montar el componente
    useEffect(() => {
        fetchCategories(); // Llamar a la función aquí
    }, [userId, authToken]);

    const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!categoryName) return;

        const response = await fetch('https://<your-api-endpoint>/menu/category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`, // Agrega tu token aquí
            },
            body: JSON.stringify({ userId, categoryName }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Category created:', result);
            setCategoryName(''); // Resetear el campo
            fetchCategories(); // Llamar nuevamente a fetchCategories
        } else {
            console.error('Error creating category:', response.statusText);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!productName || !price || !categoryId) return;

        const response = await fetch(`https://<your-api-endpoint>/menu/category/${categoryId}/product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`, // Agrega tu token aquí
            },
            body: JSON.stringify({ userId, categoryId, productName, price, description }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Product created:', result);
            setProductName(''); // Resetear el campo
            setPrice('');
            setDescription('');
            // Opcional: Recargar categorías o productos
        } else {
            console.error('Error creating product:', response.statusText);
        }
    };

    return (
        <div>
            <h2>Manage Categories</h2>
            <form onSubmit={handleCreateCategory}>
                <input
                    type="text"
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                />
                <button type="submit">Create Category</button>
            </form>

            <h2>Manage Products</h2>
            <form onSubmit={handleCreateProduct}>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required>
                    <option value="">Select Category</option>
                    {categories.map(category => (
                        <option key={category.SK} value={category.SK}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button type="submit">Create Product</button>
            </form>
        </div>
    );
};

export default MenuForm;

import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

interface Product {
    productName: string;
    productId: string;
    price: number;
    description: string;
}

interface Category {
    categoryName: string;
    SK: string;
    products?: Product[];
}

const ViewMenu: React.FC = () => {
    const { userId } = useParams<{ userId: string }>(); // Captura userId fuera del useEffect
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!userId) {
                console.error("No userId found in the URL");
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL;
                console.log(`Fetching menu data for user: ${userId}`);

                const response = await fetch(`${apiUrl}/categories/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.categories || []);
                } else {
                    console.error('Failed to fetch categories');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchCategories();
    }, [userId]); // Asegura que el fetch se ejecute cuando cambie userId

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom>
                Menu
            </Typography>
            <div>
                <h2>Categories</h2>
                <ul>
                    {categories.map((category, categoryIndex) => (
                        <li key={`${category.SK}-${categoryIndex}`}>
                            <strong>{category.categoryName}</strong>
                            <ul>
                                {category.products?.map((product, productIndex) => (
                                    <li key={`${product.productId}-${productIndex}`}>
                                        {product.productName} - ${product.price}
                                        <p>Description: {product.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </Container>
    );
};

export default ViewMenu;

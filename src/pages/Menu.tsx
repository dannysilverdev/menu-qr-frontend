import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryForm from '../components/CategoryForm';
import ProductForm from '../components/ProductForm';

interface Product {
    productName: string;
    price: number;
    description: string;
}

interface Category {
    categoryName: string;
    SK: string; // Clave única de la categoría
    products?: Product[]; // Productos opcionales
}

const Menu = () => {
    const [message, setMessage] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('No token found, please log in again.');
                navigate('/login');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL;

            try {
                const response = await fetch(`${apiUrl}/menu`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessage(data.message || 'Welcome to the Menu!');
                    setUserId(data.userId || '');

                    // Obtener categorías
                    const categoriesResponse = await fetch(`${apiUrl}/categories/${data.userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (categoriesResponse.ok) {
                        const categoriesData = await categoriesResponse.json();
                        setCategories(categoriesData.categories || []);
                    } else {
                        console.error('Failed to fetch categories');
                    }
                } else {
                    alert('Unauthorized');
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to fetch data. Please try again.');
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);


    // Categoria creada
    const handleCategoryCreated = (category: { categoryName: string; SK: string }) => {
        alert(`Category ${category.categoryName} created successfully!`);
        console.log('Created category id:', category);
        console.log('Category SK:', category.SK);

        // Agregar el prefijo CATEGORY# al SK y actualizar el estado con la nueva categoría
        const updatedCategory = {
            categoryName: category.categoryName,
            SK: `CATEGORY#${category.SK}`, // Agregar el prefijo aquí
        };

        // Actualiza el estado con la nueva categoría
        setCategories((prevCategories) => [...prevCategories, updatedCategory]);
    };

    // Categoria Eliminada
    const handleDeleteCategory = async (categoryId: string) => {
        const token = localStorage.getItem('token');
        const categoryKey = `CATEGORY#${categoryId}`; // Aquí utilizamos el prefijo

        console.log('Deleting category with key:', categoryKey); // Verifica que el key sea correcto

        const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/category/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Actualiza el estado eliminando la categoría que fue eliminada
            setCategories((prevCategories) => prevCategories.filter((category) => category.SK !== categoryKey));
            alert('Category deleted successfully!');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    };

    // Producto Creados
    const handleProductCreated = (product: Product, categoryId: string) => {
        alert(`Product ${product.productName} created successfully!`);

        setCategories((prevCategories) =>
            prevCategories.map((category) => {
                if (category.SK === `CATEGORY#${categoryId}`) {
                    return {
                        ...category,
                        products: [
                            ...(category.products || []),
                            product,
                        ],
                    };
                }
                return category;
            })
        );
    };


    return (
        <>
            <Header />
            <Container maxWidth="sm">
                <Typography variant="h4" component="h1" gutterBottom>
                    {message}
                </Typography>

                <CategoryForm userId={userId} onCategoryCreated={handleCategoryCreated} />

                <div>
                    <h2>Categories</h2>
                    <ul>
                        {categories.map((category) => (
                            <li key={category.SK}>
                                {category.categoryName} (ID: {category.SK.split('#')[1]})
                                <button onClick={() => handleDeleteCategory(category.SK.split('#')[1])}>
                                    Delete
                                </button>
                                {/* Agregar producto a la categoría */}
                                <ProductForm categoryId={category.SK.split('#')[1]} onProductCreated={(product) => handleProductCreated(product, category.SK.split('#')[1])} />
                                <ul>
                                    {category.products?.map((product, index) => (
                                        <li key={index}>
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
        </>
    );
};

export default Menu;
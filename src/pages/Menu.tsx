import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryForm from '../components/CategoryForm';

const Menu = () => {
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]); // Cambiar a un tipo más específico si es necesario
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

                    // Llamar a la API para obtener categorías
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

    const handleCategoryCreated = (category: { categoryName: string; SK: string }) => {
        alert(`Category ${category.categoryName} created successfully!`);
        setCategories((prevCategories) => [...prevCategories, category]); // Agregar el objeto de categoría completo
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
                                {category.categoryName}
                            </li>
                        ))}
                    </ul>
                </div>
            </Container>
        </>
    );
};

export default Menu;

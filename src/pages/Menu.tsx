import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryForm from '../components/CategoryForm';

const Menu = () => {
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
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
        setCategories((prevCategories) => [...prevCategories, category]);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        const token = localStorage.getItem('token');

        const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/category/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Actualiza el estado para eliminar la categoría del frontend
            setCategories((prevCategories) => prevCategories.filter((category) => category.SK !== `CATEGORY#${categoryId}`));
            alert('Category deleted successfully!');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
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
                                <button onClick={() => handleDeleteCategory(category.SK.split('#')[1])}>
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </Container>
        </>
    );
};

export default Menu;

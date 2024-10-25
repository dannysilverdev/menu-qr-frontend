import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Menu = () => {
    const [message, setMessage] = useState('');
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

    return (
        <>
            <Header />
            <Container maxWidth="sm">
                <Typography variant="h4" component="h1" gutterBottom>
                    {message}
                </Typography>
            </Container>
        </>
    );
};

export default Menu;

import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Log the current environment mode
        console.log('Current environment:', import.meta.env.MODE);

        const fetchData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL;

            const response = await fetch(`${apiUrl}/home`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message || 'Welcome Home');
            } else {
                alert('Unauthorized');
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

export default Home;

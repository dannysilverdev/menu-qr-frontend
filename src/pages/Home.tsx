import { useEffect } from 'react';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { QRCodeSVG } from 'qrcode.react';

const Home = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const menuUrl = `${import.meta.env.VITE_WEB_URL}/view-menu/${username}`;

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
                console.log('All systems OK');
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
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100vh',
                    padding: '1rem',
                    textAlign: 'center',
                }}>
                    {/*<h1 style={{ margin: '0.5rem 0' }}>Menú QR</h1>*/}
                    <p style={{ margin: '0.5rem 0' }}>Escanea para acceder</p>
                    {username ? (
                        <QRCodeSVG
                            value={menuUrl}
                            style={{ width: '100%', maxWidth: '400px', height: 'auto', marginTop: '1rem' }}
                        />
                    ) : (
                        <p style={{ marginTop: '1rem' }}>No se encontró usuario. Inicia sesión para generar el código QR.</p>
                    )}
                </div>
            </Container>
        </>
    );
};

export default Home;

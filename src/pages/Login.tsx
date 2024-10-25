import { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Paper, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import QrCodeIcon from '@mui/icons-material/QrCode';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Estado para manejar los errores
    const [isLoading, setIsLoading] = useState(false); // Estado para manejar el estado de carga
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        for (const key in import.meta.env) {
            console.log(`${key}: ${import.meta.env[key]}`);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Limpiar el error anterior
        setIsLoading(true); // Activar el estado de carga

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('token', token);
                navigate('/home');
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        } catch (error) {
            setError('An error occurred during login. Please try again later.');
        } finally {
            setIsLoading(false); // Desactivar el estado de carga
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <QrCodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            Menu QR
                        </Typography>
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <TextField
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                            />
                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Login'}
                            </Button>
                        </form>
                    </Box>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default Login;

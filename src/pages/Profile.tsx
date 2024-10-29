// src/pages/EditProfile.tsx
import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FormInput from '../components/FormInput';
import Header from '../components/Header';

const EditProfile = () => {
    const [username, setUsername] = useState('');
    const [localName, setLocalName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [description, setDescription] = useState('');
    const [socialMedia, setSocialMedia] = useState('');
    const [error, setError] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const sessionUsername = localStorage.getItem('username');

                if (!token || !sessionUsername) {
                    setError('No se encontró el token de autenticación o el nombre de usuario.');
                    return;
                }

                const response = await fetch(`${apiUrl}/user/${sessionUsername}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username || '');
                    setLocalName(data.localName || '');
                    setPhoneNumber(data.phoneNumber || '');
                    setDescription(data.description || '');
                    setSocialMedia((data.socialMedia || []).join(', '));
                } else {
                    setError('Error al cargar perfil. Intente de nuevo más tarde.');
                }
            } catch (error) {
                setError('Error al cargar perfil. Intente de nuevo más tarde.');
            }
        };

        fetchUserProfile();
    }, [apiUrl]);

    // Función para actualizar un campo en el backend
    const handleFieldUpdate = async (fieldName: string, fieldValue: string) => {
        try {
            const token = localStorage.getItem('token');
            const sessionUsername = localStorage.getItem('username');

            if (!token || !sessionUsername) {
                setError('No se encontró el token de autenticación o el nombre de usuario.');
                return;
            }

            await fetch(`${apiUrl}/user/${sessionUsername}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ [fieldName]: fieldValue }), // Actualiza solo el campo modificado
            });
        } catch (error) {
            setError(`Error al actualizar ${fieldName}. Intente de nuevo.`);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Header />
            <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <QrCodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            Editar Perfil
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <form style={{ width: '100%' }}>
                            <FormInput
                                label="Username"
                                name="username"
                                value={username}
                                onChange={() => { }}
                                disabled
                            />
                            <FormInput
                                label="Nombre del Local"
                                name="localName"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                onBlur={() => handleFieldUpdate('localName', localName)} // Actualizar al perder foco
                                required
                            />
                            <FormInput
                                label="Número de Teléfono"
                                name="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                onBlur={() => handleFieldUpdate('phoneNumber', phoneNumber)} // Actualizar al perder foco
                                required
                            />
                            <FormInput
                                label="Descripción"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => handleFieldUpdate('description', description)} // Actualizar al perder foco
                                multiline
                            />
                            <FormInput
                                label="Redes Sociales (separadas por comas)"
                                name="socialMedia"
                                value={socialMedia}
                                onChange={(e) => setSocialMedia(e.target.value)}
                                onBlur={() => handleFieldUpdate('socialMedia', socialMedia)} // Actualizar al perder foco
                            />
                        </form>
                    </Box>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default EditProfile;

import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Alert, Button, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FormInput from '../components/FormInput';
import Header from '../components/Header';

const Profile = () => {
    const [username, setUsername] = useState('');
    const [localName, setLocalName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [description, setDescription] = useState('');
    const [socialMedia, setSocialMedia] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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
                    setUsername(data.PK.split('#')[1] || '');
                    setLocalName(data.localName || '');
                    setPhoneNumber(data.phoneNumber || '');
                    setDescription(data.description || '');
                    setSocialMedia(Array.isArray(data.socialMedia) ? data.socialMedia.join(', ') : data.socialMedia || '');
                    setImageUrl(data.imageUrl || null);
                } else {
                    setError('Error al cargar perfil. Intente de nuevo más tarde.');
                }
            } catch (error) {
                console.log(error);
                setError('Error al cargar perfil. Intente de nuevo más tarde.');
            }
        };

        fetchUserProfile();
    }, [apiUrl]);

    const handleFieldUpdate = async (fieldName: string, fieldValue: string) => {
        const token = localStorage.getItem('token');
        const sessionUsername = localStorage.getItem('username');

        if (!token || !sessionUsername) {
            setError('No se encontró el token de autenticación o el nombre de usuario.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/user/update/${sessionUsername}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ [fieldName]: fieldValue }),
            });

            if (!response.ok) {
                console.error("Error en la respuesta del servidor:", response.status, response.statusText);
                setError(`Error al actualizar ${fieldName}. Intente de nuevo.`);
            }
        } catch (error) {
            console.log(error);
            setError(`Error al actualizar ${fieldName}. Intente de nuevo.`);
        }
    };

    const handleImageUpload = async () => {
        if (!image) {
            setError('Seleccione una imagen antes de subir.');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccessMessage('');

        const token = localStorage.getItem('token');
        const sessionUsername = localStorage.getItem('username');

        if (!token || !sessionUsername) {
            setError('No se encontró el token de autenticación o el nombre de usuario.');
            setIsUploading(false);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onloadend = async () => {
            const base64Image = reader.result?.toString().split(',')[1];

            try {
                const response = await fetch(`${apiUrl}/user/update/${sessionUsername}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ image: true, imageBuffer: base64Image }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.updatedAttributes && data.updatedAttributes.imageUrl) {
                        setImageUrl(`${data.updatedAttributes.imageUrl}?t=${new Date().getTime()}`);
                        setSuccessMessage('Imagen subida con éxito.');
                    }

                } else {
                    console.error("Error en la respuesta del servidor:", response.status, response.statusText);
                    setError('Error al cargar la imagen. Intente de nuevo.');
                }
            } catch (error) {
                console.log(error);
                setError('Error al cargar la imagen. Intente de nuevo.');
            } finally {
                setIsUploading(false);
            }
        };
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
                        {successMessage && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {successMessage}
                            </Alert>
                        )}
                        {imageUrl && (
                            <Box sx={{ mt: 2 }}>
                                <img src={imageUrl} alt="Imagen de perfil" width="100%" style={{ borderRadius: '8px' }} />
                            </Box>
                        )}
                        <form style={{ width: '100%' }}>
                            <FormInput label="Username" name="username" value={username} onChange={() => { }} disabled />
                            <FormInput label="Nombre del Local" name="localName" value={localName} onChange={(e) => setLocalName(e.target.value)} onBlur={() => handleFieldUpdate('localName', localName)} required />
                            <FormInput label="Número de Teléfono" name="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} onBlur={() => handleFieldUpdate('phoneNumber', phoneNumber)} required />
                            <FormInput label="Descripción" name="description" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => handleFieldUpdate('description', description)} multiline />
                            <FormInput label="Redes Sociales (separadas por comas)" name="socialMedia" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)} onBlur={() => handleFieldUpdate('socialMedia', socialMedia)} />
                            <Box sx={{ mt: 2 }}>
                                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
                                <Button variant="contained" color="primary" onClick={handleImageUpload} sx={{ mt: 1 }} disabled={isUploading}>
                                    {isUploading ? <CircularProgress size={24} color="inherit" /> : 'Subir Imagen'}
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default Profile;

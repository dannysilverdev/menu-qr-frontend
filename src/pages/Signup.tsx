// src/pages/Signup.tsx
import { useState } from 'react';
import { Button, Container, Typography, Paper, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FormInput from '../components/FormInput';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localName, setLocalName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [description, setDescription] = useState('');
    const [socialMedia, setSocialMedia] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_API_URL;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result?.toString().split(',')[1] || null); // Almacena solo la cadena base64 sin el prefijo
            };
            reader.readAsDataURL(file); // Convierte la imagen a base64
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const payload = {
                username,
                password,
                localName,
                phoneNumber,
                description,
                socialMedia: socialMedia.split(',').map(s => s.trim()).join(','),
                imageBase64, // Incluimos la imagen en base64
            };

            const response = await fetch(`${apiUrl}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                navigate('/login');
            } else {
                setError('Registro fallido. Por favor revisa tus datos e inténtalo de nuevo.');
            }
        } catch (error) {
            setError('Ocurrió un error durante el registro. Por favor inténtalo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <QrCodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            Menu QR - Registro
                        </Typography>
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <FormInput label="Username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <FormInput label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <FormInput label="Nombre del Local" name="localName" value={localName} onChange={(e) => setLocalName(e.target.value)} required />
                            <FormInput label="Número de Teléfono" name="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                            <FormInput label="Descripción" name="description" value={description} onChange={(e) => setDescription(e.target.value)} multiline />
                            <FormInput label="Redes Sociales (separadas por comas)" name="socialMedia" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)} />

                            {/* Campo para la imagen */}
                            <Box sx={{ mt: 2 }}>
                                <FormInput
                                    label="Imagen de Perfil"
                                    type="file"
                                    name="image"
                                    onChange={handleImageChange}
                                />
                            </Box>

                            {/* Vista previa de la imagen (opcional) */}
                            {image && (
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Typography variant="body2">Vista previa de la imagen:</Typography>
                                    <img src={URL.createObjectURL(image)} alt="Vista previa" width="100" height="100" style={{ marginTop: '8px', borderRadius: '50%' }} />
                                </Box>
                            )}

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
                                {isLoading ? 'Cargando...' : 'Registrarse'}
                            </Button>
                        </form>
                    </Box>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default Signup;

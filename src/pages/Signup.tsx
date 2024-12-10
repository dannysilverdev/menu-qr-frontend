import { useState } from 'react';
import { Button, Container, Typography, Paper, Box, Alert, Dialog, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Cropper from 'react-easy-crop';
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
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Estado para recorte de imágenes
    const [openCropDialog, setOpenCropDialog] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setImagePreview(reader.result as string); // Muestra la imagen para recorte
                    setOpenCropDialog(true);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropSubmit = async () => {
        if (!imagePreview || !croppedAreaPixels) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError('Error al procesar la imagen.');
            return;
        }

        const img = new Image();
        img.src = imagePreview;

        img.onload = () => {
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                img,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            const pngDataUrl = canvas.toDataURL('image/png');
            const base64String = pngDataUrl.split(',')[1];
            setImageBase64(base64String);
            setOpenCropDialog(false);
        };

        img.onerror = () => {
            setError('Error al cargar la imagen. Por favor intenta con otro archivo.');
        };
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
                imageBase64, // Incluimos la imagen recortada en base64
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
                                <FormInput label="Imagen de Perfil" type="file" name="image" onChange={handleImageChange} />
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={isLoading}>
                                {isLoading ? 'Cargando...' : 'Registrarse'}
                            </Button>
                        </form>
                    </Box>
                </Paper>

                {/* Dialog para el recorte de imágenes */}
                <Dialog open={openCropDialog} onClose={() => setOpenCropDialog(false)} maxWidth="md" fullWidth>
                    <DialogContent sx={{ height: '70vh' }}>
                        {imagePreview && (
                            <Cropper
                                image={imagePreview}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Cambia según la relación de aspecto deseada
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCropDialog(false)} color="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={handleCropSubmit} color="primary" variant="contained">
                            Recortar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </ThemeProvider>
    );
};

export default Signup;

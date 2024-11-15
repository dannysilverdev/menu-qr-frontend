import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Alert, Button, LinearProgress, Dialog, DialogActions, DialogContent, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FormInput from '../components/FormInput';
import Header from '../components/Header';
import Cropper from 'react-easy-crop';

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
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any | null>(null);
    const [openCropDialog, setOpenCropDialog] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsImageLoading(true);
            try {
                const token = localStorage.getItem('token');
                const sessionUsername = localStorage.getItem('username');

                if (!token || !sessionUsername) {
                    setError('No se encontró el token de autenticación o el nombre de usuario.');
                    setIsImageLoading(false);
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
                    setImageUrl(data.imageUrl ? `${data.imageUrl}?t=${new Date().getTime()}` : null);
                    setIsImageLoading(false);
                } else {
                    setError('Error al cargar perfil. Intente de nuevo más tarde.');
                    setIsImageLoading(false);
                }
            } catch (error) {
                console.log(error);
                setError('Error al cargar perfil. Intente de nuevo más tarde.');
                setIsImageLoading(false);
            }
        };

        fetchUserProfile();
    }, [apiUrl]);

    useEffect(() => {
        const rootElement = document.getElementById('root');
        if (rootElement) {
            if (openCropDialog) {
                rootElement.setAttribute('inert', '');
            } else {
                rootElement.removeAttribute('inert');
            }
        }
    }, [openCropDialog]);

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImage(file);

            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
                setOpenCropDialog(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropSubmit = async () => {
        if (!image || !croppedAreaPixels) return;

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

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = imagePreview || '';
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

            canvas.toBlob(async (blob) => {
                if (blob) {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
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
                            setOpenCropDialog(false);
                        }
                    };
                }
            }, 'image/png');
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
                        <label htmlFor="upload-image" style={{ cursor: 'pointer' }}>
                            {isImageLoading ? (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px', width: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : imageUrl && !imageError ? (
                                <Box sx={{ mt: 2 }}>
                                    <img
                                        src={imageUrl}
                                        alt="Imagen de perfil"
                                        style={{ height: '150px', width: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                        onError={() => setImageError(true)}
                                    />
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        mt: 2,
                                        height: '150px',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        backgroundColor: 'grey.200',
                                    }}
                                >
                                    <Typography variant="subtitle1">No hay imagen disponible</Typography>
                                </Box>
                            )}
                            <input
                                type="file"
                                id="upload-image"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <form style={{ width: '100%' }}>
                            <FormInput label="Username" name="username" value={username} onChange={() => { }} disabled />
                            <FormInput label="Nombre del Local" name="localName" value={localName} onChange={(e) => setLocalName(e.target.value)} onBlur={() => handleFieldUpdate('localName', localName)} required />
                            <FormInput label="Número de Teléfono" name="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} onBlur={() => handleFieldUpdate('phoneNumber', phoneNumber)} required />
                            <FormInput label="Descripción" name="description" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => handleFieldUpdate('description', description)} multiline />
                            <FormInput label="Redes Sociales (separadas por comas)" name="socialMedia" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)} onBlur={() => handleFieldUpdate('socialMedia', socialMedia)} />
                        </form>
                    </Box>
                </Paper>
            </Container>
            <Dialog
                open={openCropDialog}
                onClose={() => setOpenCropDialog(false)}
                maxWidth="md"
                fullWidth
                disableEnforceFocus
            >
                <DialogContent sx={{ height: '70vh' }}>
                    {imagePreview && (
                        <Cropper
                            image={imagePreview}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCropDialog(false)} color="secondary">Cancelar</Button>
                    <Button onClick={handleCropSubmit} color="primary" variant="contained">Recortar y Subir</Button>
                </DialogActions>
            </Dialog>

            {isUploading && <LinearProgress sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 8 }} />}
        </ThemeProvider>
    );
};

export default Profile;
import React, { useEffect, useState } from 'react';
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    Typography,
    Container,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    useMediaQuery,
    CircularProgress,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhoneIcon from '@mui/icons-material/Phone';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const username = localStorage.getItem('username');
console.log(`Usuario: ${username}`);

interface Product {
    productName: string;
    productId: string;
    price: number;
    description: string;
    status: boolean;
    order: number; // Nuevo atributo para el orden
}

interface Category {
    categoryName: string;
    SK: string;
    products?: Product[];
    order: number;
}

interface User {
    localName: string;
    phoneNumber: string;
    description: string;
    socialMedia: string;
    imageUrl: string;
}

const ViewMenu: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mode, setMode] = useState<'light' | 'dark'>(useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light');

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? { primary: { main: '#000000' }, background: { default: '#FFFFFF', paper: '#FFFFFF' } }
                        : { primary: { main: '#FFFFFF' }, background: { default: '#000000', paper: '#000000' } }),
                },
            }),
        [mode]
    );

    const toggleColorMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const fetchCategories = async () => {
            if (!userId) return;
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/view-menu/${userId}`);
                if (response.ok) {
                    const data = await response.json();

                    console.log('Respuesta completa del backend:', data);

                    // Ordenar categorías y sus productos
                    const categories: Category[] = data.categories
                        .sort((a: Category, b: Category) => a.order - b.order) // Ordenar las categorías por `order`
                        .map((category: Category) => ({
                            ...category,
                            products: category.products
                                ?.filter(product => product.status)
                                .sort((a, b) => a.order - b.order), // Ordenar productos por `order`
                        }));

                    setCategories(categories);
                } else {
                    console.error('Error al obtener las categorías');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchUser = async () => {
            if (!userId) return;
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/user/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser({
                        localName: data.localName,
                        phoneNumber: data.phoneNumber,
                        description: data.description,
                        socialMedia: data.socialMedia,
                        imageUrl: data.imageUrl || '',
                    });
                } else {
                    console.error('Error al obtener la información del usuario');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
        fetchUser();
    }, [userId]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="sm" sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
                <Header mode={mode} toggleColorMode={toggleColorMode} user={user} />
                {isLoading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Categories categories={categories} />
                )}
            </Container>
        </ThemeProvider>
    );
};

function Header({ mode, toggleColorMode, user }: { mode: 'light' | 'dark'; toggleColorMode: () => void; user: User | null }) {
    if (!user) return null;

    const [imageError, setImageError] = useState(false);

    const [instagram, facebook] = typeof user.socialMedia === 'string'
        ? user.socialMedia.split(',').map((url) => url.trim())
        : [null, null];

    return (
        <Card sx={{ mb: 4, bgcolor: 'background.paper', boxShadow: 'none', border: '1px solid', borderColor: 'primary.main', position: 'relative' }}>
            <CardContent>
                {imageError ? (
                    <Box
                        sx={{
                            width: '100%',
                            height: 150,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            backgroundColor: 'grey.200',
                        }}
                    >
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5h2V18h-2v-1.5zm2.07-7.75-.9.92c-.29.29-.44.68-.44 1.09V13h2v-1.5h.5c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-1l.9-.92c.29-.29.44-.68.44-1.09 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5h2c0-.41.34-.75.75-.75s.75.34.75.75-.34.75-.75.75h-1z" fill="currentColor" />
                        </svg>
                        <Typography variant="subtitle1" sx={{ ml: 1 }}>
                            No hay imagen disponible
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        component="img"
                        src={`${user.imageUrl}?${new Date().getTime()}`}
                        alt="Imagen del local"
                        onError={() => setImageError(true)}
                        sx={{ width: '100%', height: 150, objectFit: 'cover', mb: 2, borderRadius: 1 }}
                    />
                )}
                <IconButton
                    onClick={toggleColorMode}
                    color="primary"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    {user.localName}
                </Typography>
                <Typography variant="body1" align="center" gutterBottom>
                    {user.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <IconButton color="primary" href={`tel:${user.phoneNumber}`} aria-label="Llamar">
                        <PhoneIcon />
                    </IconButton>
                    {instagram && (
                        <IconButton color="primary" href={instagram} aria-label="Instagram">
                            <InstagramIcon />
                        </IconButton>
                    )}
                    {facebook && (
                        <IconButton color="primary" href={facebook} aria-label="Facebook">
                            <FacebookIcon />
                        </IconButton>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

function Categories({ categories }: { categories: Category[] }) {
    return (
        <Box>
            {categories.map((category, index) => (
                <Accordion key={index} sx={{ mb: 2, bgcolor: 'background.paper', boxShadow: 'none', border: '1px solid', borderColor: 'primary.main' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />} aria-controls={`panel${index}-content`} id={`panel${index}-header`}>
                        <Typography variant="h6">{category.categoryName}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List disablePadding>
                            {category.products?.map((product, productIndex) => (
                                <ListItem key={productIndex} disableGutters>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                                                <Typography variant="subtitle1" align="justify" sx={{ width: '80%' }}>
                                                    {product.productName}
                                                </Typography>
                                                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                                                    ${product.price.toFixed(0)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={<Typography variant="body2" color="text.secondary" align="justify" sx={{ width: '80%' }}>{product.description}</Typography>}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}

export default ViewMenu;
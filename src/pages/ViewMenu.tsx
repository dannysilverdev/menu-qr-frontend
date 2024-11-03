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
} from '@mui/material';
import { useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhoneIcon from '@mui/icons-material/Phone';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface Product {
    productName: string;
    productId: string;
    price: number;
    description: string;
}

interface Category {
    categoryName: string;
    SK: string;
    products?: Product[];
}

interface User {
    localName: string;
    phoneNumber: string;
    description: string;
    socialMedia: string;
}

const ViewMenu: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [user, setUser] = useState<User | null>(null);
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
                    setCategories(data.categories || []);
                } else {
                    console.error('Error al obtener las categorías');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        const fetchUser = async () => {
            if (!userId) return;
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/user/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Datos del usuario:", data);  // Mensaje de depuración
                    setUser({
                        localName: data.localName,
                        phoneNumber: data.phoneNumber,
                        description: data.description,
                        socialMedia: data.socialMedia,
                    });
                } else {
                    console.error('Error al obtener la información del usuario');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
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
                <Categories categories={categories} />
            </Container>
        </ThemeProvider>
    );
};

function Header({ mode, toggleColorMode, user }: { mode: 'light' | 'dark'; toggleColorMode: () => void; user: User | null }) {
    // Verificamos si socialMedia es una cadena y luego aplicamos split; de lo contrario, asignamos un arreglo vacío.
    const [instagram, facebook] = typeof user?.socialMedia === 'string'
        ? user.socialMedia.split(',').map((url) => url.trim())
        : [null, null];

    return (
        <Card sx={{ mb: 4, bgcolor: 'background.paper', boxShadow: 'none', border: '1px solid', borderColor: 'primary.main', position: 'relative' }}>
            <CardContent>
                <IconButton
                    onClick={toggleColorMode}
                    color="primary"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    {user ? user.localName : 'Café Delicia'}
                </Typography>
                <Typography variant="body1" align="center" gutterBottom>
                    {user ? user.description : 'Disfruta de nuestro café de especialidad y deliciosos pasteles caseros.'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    {user && (
                        <>
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
                        </>
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
                                            <Typography variant="subtitle1">
                                                {product.productName}
                                                <Typography component="span" variant="body2" sx={{ float: 'right' }}>
                                                    ${product.price.toFixed(2)}
                                                </Typography>
                                            </Typography>
                                        }
                                        secondary={<Typography variant="body2" color="text.secondary">{product.description}</Typography>}
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

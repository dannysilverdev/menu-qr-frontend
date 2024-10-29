import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    IconButton,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    Modal,
    useTheme,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryForm from '../components/CategoryForm';
import ProductForm from '../components/ProductForm';

interface Product {
    productName: string;
    price: number;
    description: string;
    productId: string;
    createdAt: string;
    categoryId: string;
}

interface Category {
    categoryName: string;
    SK: string;
    products?: Product[];
}

const Menu = () => {
    const [message, setMessage] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [openProductForm, setOpenProductForm] = useState<{ open: boolean; categoryId: string | null }>({ open: false, categoryId: null });
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('No token found, please log in again.');
                navigate('/login');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL;

            try {
                const response = await fetch(`${apiUrl}/menu`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessage(data.message || 'Welcome to the Menu!');
                    setUserId(data.userId || '');

                    const categoriesResponse = await fetch(`${apiUrl}/categories/${data.userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (categoriesResponse.ok) {
                        const categoriesData = await categoriesResponse.json();
                        setCategories(categoriesData.categories || []);
                    } else {
                        console.error('Failed to fetch categories');
                    }
                } else {
                    alert('Unauthorized');
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to fetch data. Please try again.');
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);

    const handleCategoryCreated = (category: { categoryName: string; SK: string }) => {
        alert(`Category ${category.categoryName} created successfully!`);
        const updatedCategory = {
            categoryName: category.categoryName,
            SK: `CATEGORY#${category.SK}`,
        };
        setCategories((prevCategories) => [...prevCategories, updatedCategory]);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        // Confirmación antes de eliminar
        const confirmed = window.confirm('Are you sure you want to delete this category? This action cannot be undone.');

        if (!confirmed) {
            return; // Salir si el usuario no confirma
        }

        const token = localStorage.getItem('token');
        const categoryKey = `CATEGORY#${categoryId}`;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/category/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            setCategories((prevCategories) => prevCategories.filter((category) => category.SK !== categoryKey));
            alert('Category deleted successfully!');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    };

    const handleProductCreated = (product: Omit<Product, 'categoryId'>, categoryId: string) => {
        alert(`Product ${product.productName} created successfully!`);
        const newProduct = { ...product, categoryId };

        setCategories((prevCategories) =>
            prevCategories.map((category) => {
                if (category.SK === `CATEGORY#${categoryId}`) {
                    return {
                        ...category,
                        products: [
                            ...(category.products || []),
                            newProduct,
                        ],
                    };
                }
                return category;
            })
        );
    };

    const openProductModal = (categoryId: string) => {
        setOpenProductForm({ open: true, categoryId });
    };

    const closeProductModal = () => {
        setOpenProductForm({ open: false, categoryId: null });
    };

    return (
        <>
            <Header />
            <Container maxWidth="sm">
                <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mt: 2, color: theme.palette.primary.main }}>
                    {message}
                </Typography>

                <CategoryForm userId={userId} onCategoryCreated={handleCategoryCreated} />

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" component="h2">
                        Categories
                    </Typography>
                    <List>
                        {categories.map((category) => (
                            <Box key={category.SK} sx={{ mt: 1 }}>
                                <ListItem>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {category.categoryName}
                                    </Typography>
                                    <IconButton onClick={() => handleDeleteCategory(category.SK.split('#')[1])} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton onClick={() => openProductModal(category.SK.split('#')[1])} color="primary">
                                        <AddIcon />
                                    </IconButton>
                                </ListItem>

                                {/* Productos en una sola línea */}
                                <List disablePadding>
                                    {category.products?.map((product) => (
                                        <ListItem key={product.productId} sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                                            <ListItemText
                                                primary={product.productName}
                                                primaryTypographyProps={{ variant: 'body1' }}
                                            />
                                            <Chip
                                                label={`$${product.price.toFixed(2)}`}
                                                color="primary"
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                <Divider />
                            </Box>
                        ))}
                    </List>
                </Box>

                {/* Modal para agregar producto */}
                <Modal
                    open={openProductForm.open}
                    onClose={closeProductModal}
                    aria-labelledby="add-product-modal"
                    aria-describedby="add-product-form"
                >
                    <Box sx={{ width: '90%', maxWidth: 400, bgcolor: 'background.paper', p: 4, mx: 'auto', mt: 8, borderRadius: 2 }}>
                        <ProductForm
                            categoryId={openProductForm.categoryId as string}
                            onProductCreated={(product) => {
                                handleProductCreated(product, openProductForm.categoryId as string);
                                closeProductModal();
                            }}
                        />
                    </Box>
                </Modal>
            </Container>
        </>
    );
};

export default Menu;

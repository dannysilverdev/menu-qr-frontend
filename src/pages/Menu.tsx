import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    IconButton,
    Box,
    List,
    ListItem,
    Modal,
    TextField,
    useTheme,
    Paper
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
    //const [message, setMessage] = useState<string>('');  
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
                    //message setMessage(data.message || 'Welcome to the Menu!');
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
        const confirmed = window.confirm('Are you sure you want to delete this category? This action cannot be undone.');

        if (!confirmed) {
            return;
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

    const handleCategoryNameChange = (index: number, newName: string) => {
        setCategories((prevCategories) =>
            prevCategories.map((category, i) => (i === index ? { ...category, categoryName: newName } : category))
        );
    };

    const handleCategoryNameBlur = async (index: number) => {
        const category = categories[index];
        const { SK, categoryName } = category;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/category/${SK.split('#')[1]}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ categoryName }),
            });

            if (!response.ok) {
                console.error('Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const handleProductChange = (productId: string, field: keyof Product, value: any) => {
        setCategories((prevCategories) =>
            prevCategories.map((category) => ({
                ...category,
                products: category.products?.map((product) =>
                    product.productId === productId ? { ...product, [field]: value } : product
                ),
            }))
        );
    };

    const handleProductBlur = async (product: Product) => {
        const { productId, productName, price, description } = product;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/product/${productId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ productName, price, description }),
            });

            if (!response.ok) {
                console.error('Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    return (
        <>
            <Header />
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                    {/* Encabezado del mensaje */}
                    {/*<Typography variant="h5" component="h1" gutterBottom align="center" sx={{ color: theme.palette.primary.main }}>
                {message}
            </Typography>*/}

                    {/* Formulario para agregar categoría */}
                    <CategoryForm userId={userId} onCategoryCreated={handleCategoryCreated} />

                    {/* Listado de categorías y productos */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Categorías
                        </Typography>
                        <List>
                            {categories.map((category, index) => (
                                <Paper key={category.SK} elevation={2} sx={{ mb: 2, p: 2 }}>
                                    {/* Categoría */}
                                    <ListItem sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
                                        <TextField
                                            value={category.categoryName}
                                            onChange={(e) => handleCategoryNameChange(index, e.target.value)}
                                            onBlur={() => handleCategoryNameBlur(index)}
                                            variant="standard"
                                            fullWidth
                                            sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
                                        />
                                        <IconButton onClick={() => handleDeleteCategory(category.SK.split('#')[1])} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                        <IconButton onClick={() => openProductModal(category.SK.split('#')[1])} color="primary">
                                            <AddIcon />
                                        </IconButton>
                                    </ListItem>

                                    {/* Lista de productos */}
                                    <List sx={{ mt: 1, pl: 2 }}>
                                        {category.products?.map((product) => (
                                            <Paper key={product.productId} elevation={1} sx={{ mb: 1, p: 2 }}>
                                                <ListItem sx={{ display: 'flex', flexDirection: 'column', py: 1 }}>
                                                    {/* Nombre del producto */}
                                                    <TextField
                                                        label="Name"
                                                        value={product.productName}
                                                        onChange={(e) => handleProductChange(product.productId, 'productName', e.target.value)}
                                                        onBlur={() => handleProductBlur(product)}
                                                        fullWidth
                                                        variant="standard"
                                                        sx={{ mb: 1 }}
                                                    />
                                                    {/* Descripción y precio en una sola línea */}
                                                    <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                                                        <TextField
                                                            label="Description"
                                                            value={product.description}
                                                            onChange={(e) => handleProductChange(product.productId, 'description', e.target.value)}
                                                            onBlur={() => handleProductBlur(product)}
                                                            fullWidth
                                                            variant="standard"
                                                        />
                                                        <TextField
                                                            label="Price"
                                                            type="number"
                                                            value={product.price}
                                                            onChange={(e) => handleProductChange(product.productId, 'price', parseFloat(e.target.value))}
                                                            onBlur={() => handleProductBlur(product)}
                                                            variant="standard"
                                                            sx={{ maxWidth: '30%' }}
                                                        />
                                                    </Box>
                                                </ListItem>
                                            </Paper>
                                        ))}
                                    </List>
                                </Paper>
                            ))}
                        </List>
                    </Box>
                </Paper>

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

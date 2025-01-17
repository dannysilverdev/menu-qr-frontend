import React, { useEffect, useState, useRef } from 'react';
import Sortable from 'sortablejs';
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
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    ToggleOn as ToggleOnIcon,
    ToggleOff as ToggleOffIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
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
    isActive: boolean;
    order: number;
}

interface Category {
    categoryName: string;
    SK: string;
    products?: Product[];
}

const Menu: React.FC = () => {
    const [userId, setUserId] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [openProductForm, setOpenProductForm] = useState<{ open: boolean; categoryId: string | null }>({ open: false, categoryId: null });
    const navigate = useNavigate();
    const theme = useTheme();
    const sortableRefs = useRef<Sortable[]>([]);

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
                    setUserId(data.userId || '');

                    const categoriesResponse = await fetch(`${apiUrl}/categories/${data.userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (categoriesResponse.ok) {
                        const categoriesData = await categoriesResponse.json();
                        const sortedCategories = categoriesData.categories.map((category: Category) => ({
                            ...category,
                            products: category.products?.sort((a: Product, b: Product) => a.order - b.order),
                        }));
                        setCategories(sortedCategories);
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

    useEffect(() => {
        categories.forEach((category, index) => {
            const listElement = document.getElementById(`product-list-${index}`);
            if (listElement) {
                const sortable = Sortable.create(listElement, {
                    animation: 150,
                    onEnd: async (evt) => {
                        if (evt.oldIndex === undefined || evt.newIndex === undefined) {
                            console.error('Invalid index received from SortableJS');
                            return;
                        }

                        const reorderedProducts = [...(category.products || [])];
                        const [movedItem] = reorderedProducts.splice(evt.oldIndex, 1);
                        reorderedProducts.splice(evt.newIndex, 0, movedItem);

                        setCategories((prevCategories) =>
                            prevCategories.map((cat, i) =>
                                i === index ? { ...cat, products: reorderedProducts } : cat
                            )
                        );

                        await fetch(`${import.meta.env.VITE_API_URL}/menu/category/${category.SK.split('#')[1]}/reorder`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                            body: JSON.stringify({
                                products: reorderedProducts.map((product, idx) => ({
                                    productId: product.productId,
                                    order: idx + 1,
                                })),
                            }),
                        });
                    },
                });

                sortableRefs.current[index] = sortable;
            }
        });

        return () => {
            sortableRefs.current.forEach((sortable) => sortable.destroy());
            sortableRefs.current = [];
        };
    }, [categories]);

    const handleToggleProductStatus = async (product: Product) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/product/${product.productId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    productName: product.productName,
                    price: product.price,
                    description: product.description,
                    isActive: !product.isActive
                }),
            });

            if (response.ok) {
                setCategories((prevCategories) =>
                    prevCategories.map((category) => ({
                        ...category,
                        products: category.products?.map((p) =>
                            p.productId === product.productId
                                ? { ...p, isActive: !p.isActive }
                                : p
                        ),
                    }))
                );
            } else {
                console.error('Failed to update product status');
            }
        } catch (error) {
            console.error('Error updating product status:', error);
        }
    };

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

    const handleProductCreated = (product: Omit<Product, 'categoryId' | 'order'>, categoryId: string) => {
        alert(`Product ${product.productName} created successfully!`);

        const category = categories.find((cat) => cat.SK === `CATEGORY#${categoryId}`);
        const newOrder = (category?.products?.length || 0) + 1;

        const newProduct: Product = {
            ...product,
            categoryId,
            order: newOrder,
        };

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

    const handleDeleteProduct = async (productId: string, categoryId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this product? This action cannot be undone.');

        if (!confirmed) {
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/category/${categoryId}/product/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setCategories((prevCategories) =>
                    prevCategories.map((category) => {
                        if (category.SK === `CATEGORY#${categoryId}`) {
                            return {
                                ...category,
                                products: category.products?.filter((product) => product.productId !== productId),
                            };
                        }
                        return category;
                    })
                );
                alert('Product deleted successfully!');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    };

    const handleProductBlur = async (product: Product) => {
        const { productId, productName, price, description, isActive } = product;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/product/${productId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ productName, price, description, isActive }),
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
                    <CategoryForm userId={userId} onCategoryCreated={handleCategoryCreated} />

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Categorías
                        </Typography>
                        <List>
                            {categories.map((category, index) => (
                                <Accordion key={category.SK} sx={{ mb: 2 }}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`category-${index}-content`}
                                        id={`category-${index}-header`}
                                    >
                                        <TextField
                                            value={category.categoryName}
                                            onChange={(e) => handleCategoryNameChange(index, e.target.value)}
                                            onBlur={() => handleCategoryNameBlur(index)}
                                            variant="standard"
                                            fullWidth
                                            sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
                                        />
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Button
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDeleteCategory(category.SK.split('#')[1])}
                                                color="error"
                                                variant="outlined"
                                            >
                                                Eliminar
                                            </Button>
                                            <Button
                                                startIcon={<AddIcon />}
                                                onClick={() => openProductModal(category.SK.split('#')[1])}
                                                color="primary"
                                                variant="contained"
                                            >
                                                Producto
                                            </Button>
                                        </Box>
                                        <List id={`product-list-${index}`}>
                                            {category.products?.map((product) => (
                                                <Paper
                                                    key={product.productId}
                                                    elevation={1}
                                                    sx={{
                                                        mb: 2,
                                                        p: 2,
                                                        opacity: product.isActive ? 1 : 0.5
                                                    }}
                                                >
                                                    <ListItem sx={{ display: 'flex', flexDirection: 'column', py: 1 }}>
                                                        <TextField
                                                            label="Name"
                                                            value={product.productName}
                                                            onChange={(e) => handleProductChange(product.productId, 'productName', e.target.value)}
                                                            onBlur={() => handleProductBlur(product)}
                                                            fullWidth
                                                            variant="outlined"
                                                            sx={{ mb: 2 }}
                                                        />
                                                        <TextField
                                                            label="Description"
                                                            value={product.description}
                                                            onChange={(e) => handleProductChange(product.productId, 'description', e.target.value)}
                                                            onBlur={() => handleProductBlur(product)}
                                                            fullWidth
                                                            multiline
                                                            rows={3}
                                                            variant="outlined"
                                                            sx={{ mb: 2 }}
                                                        />
                                                        <Box sx={{ display: 'flex', width: '100%', gap: 2, alignItems: 'center' }}>
                                                            <TextField
                                                                label="Price"
                                                                type="number"
                                                                value={product.price}
                                                                onChange={(e) => handleProductChange(product.productId, 'price', parseFloat(e.target.value))}
                                                                onBlur={() => handleProductBlur(product)}
                                                                variant="outlined"
                                                                sx={{ maxWidth: '30%' }}
                                                            />
                                                            <IconButton
                                                                onClick={() => handleToggleProductStatus(product)}
                                                                color={product.isActive ? "primary" : "default"}
                                                                sx={{ ml: 1 }}
                                                            >
                                                                {product.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => handleDeleteProduct(product.productId, category.SK.split('#')[1])}
                                                                color="error"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                    </ListItem>
                                                </Paper>
                                            ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </List>
                    </Box>
                </Paper>

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


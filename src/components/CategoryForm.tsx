import React, { useState } from 'react';
import { TextField, Button, Box, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface CategoryFormProps {
    userId: string;
    onCategoryCreated: (category: { categoryName: string; SK: string }) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ userId, onCategoryCreated }) => {
    const [categoryName, setCategoryName] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/menu/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userId, categoryName }),
            });

            if (response.ok) {
                const data = await response.json();
                onCategoryCreated({ categoryName: data.categoryName, SK: data.categoryId });
                setCategoryName('');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Failed to create category. Please try again.');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <form onSubmit={handleSubmit}>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        label="Category Name"
                        variant="outlined"
                        fullWidth
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        sx={{ height: 'fit-content' }}
                    >
                        Add
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default CategoryForm;

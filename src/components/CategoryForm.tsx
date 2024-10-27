import React, { useState } from 'react';

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
                // Asegúrate de que data tenga la estructura correcta
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
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category Name"
                required
            />
            <button type="submit">Create Category</button>
        </form>
    );
};

export default CategoryForm;

// src/components/FormInput.tsx
import React from 'react';
import { TextField } from '@mui/material';

interface FormInputProps {
    label: string;
    type?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    multiline?: boolean;
    disabled?: boolean;
    onBlur?: () => void | Promise<void>; // Agregamos `onBlur` como opcional
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    required = false,
    multiline = false,
    disabled = false,
    onBlur,  // Añadimos `onBlur` aquí
}) => (
    <TextField
        label={label}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        fullWidth
        required={required}
        margin="normal"
        multiline={multiline}
        disabled={disabled}
        onBlur={onBlur} // Pasamos `onBlur` al TextField
    />
);

export default FormInput;

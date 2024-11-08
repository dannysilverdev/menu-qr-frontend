// src/components/FormInput.tsx
import React from 'react';
import { TextField } from '@mui/material';

interface FormInputProps {
    label: string;
    type?: string;
    name: string;
    value?: string; // Cambiamos a opcional para archivos
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    multiline?: boolean;
    disabled?: boolean;
    onBlur?: () => void | Promise<void>;
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
    onBlur,
}) => {
    return type === 'file' ? (
        <input
            type="file"
            name={name}
            onChange={onChange}
            required={required}
            disabled={disabled}
            onBlur={onBlur}
        />
    ) : (
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
            onBlur={onBlur}
        />
    );
};

export default FormInput;

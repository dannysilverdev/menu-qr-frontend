import { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, Box, List, ListItem, ListItemText, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    // Función para abrir o cerrar el Drawer
    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    // Función de logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Contenido del Drawer
    const drawerContent = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem component="button" key="Inicio" onClick={() => navigate('/home')}>
                    <ListItemText primary="Inicio" />
                </ListItem>
                <ListItem component="button" key="menu" onClick={() => navigate('/menu')}>
                    <ListItemText primary="Menu" />
                </ListItem>
                <ListItem component="button" key="Logout" onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    {/* IconButton para abrir el Drawer en dispositivos móviles */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={toggleDrawer(true)}
                        sx={{ display: { xs: 'flex', md: 'none' }, mr: 2 }} // Mostrar solo en pantallas pequeñas
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Menu QR
                    </Typography>
                    {/* Enlaces visibles solo en modo desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <Button color="inherit" onClick={() => navigate('/home')}>Inicio</Button>
                        <Button color="inherit" onClick={() => navigate('/menu')}>Menú</Button>
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer para mostrar el menú lateral en dispositivos móviles */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                {drawerContent}
            </Drawer>

            {/* Espacio debajo del AppBar para que el contenido no quede cubierto */}
            <Box sx={{ mt: 8 }} />
        </>
    );
};

export default Header;

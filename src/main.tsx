import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline } from '@mui/material'

import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)

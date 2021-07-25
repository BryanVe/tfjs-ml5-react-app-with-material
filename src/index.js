import React from 'react';
import { render } from 'react-dom';
import { ThemeProvider } from '@material-ui/core'
import theme from 'theme';
import App from './App';
import './index.css'


render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);

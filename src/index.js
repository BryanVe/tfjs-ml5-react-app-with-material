import React from 'react';
import { render } from 'react-dom';
import { ThemeProvider } from '@material-ui/core'
import { BrowserRouter as Router } from 'react-router-dom'

import theme from 'theme';
import App from './App';
import './index.css'


render(
  <Router>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Router>,
  document.getElementById('root')
);

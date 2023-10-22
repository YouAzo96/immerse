import React, { useEffect } from 'react';
import Routes from './routes';

// Import Scss
import "./assets/scss/themes.scss";

// Import the Axios library for making API calls
import axios from 'axios';

// Selector and Redux setup
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

// Replace the fakeBackend import with actual API functions
import { registerUser, loginUser } from './apis/api';


function App() {
  const selectLayoutProperties = createSelector(
    (state) => state.Layout,
    (layout) => ({
      layoutMode: layout.layoutMode,
    })
  );

  const { layoutMode } = useSelector(selectLayoutProperties);

  useEffect(() => {
    layoutMode && localStorage.setItem("layoutMode", layoutMode);
  }, [layoutMode]);


  return <Routes />;
}

export default App;

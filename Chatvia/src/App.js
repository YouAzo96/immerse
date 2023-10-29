import React, { useEffect } from 'react';
import Routes from './routes';

// Import Scss
import './assets/scss/themes.scss';

// Selector and Redux setup
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

function App() {
  const selectLayoutProperties = createSelector(
    (state) => state.Layout,
    (layout) => ({
      layoutMode: layout.layoutMode,
    })
  );

  const { layoutMode } = useSelector(selectLayoutProperties);

  useEffect(() => {
    layoutMode && localStorage.setItem('layoutMode', layoutMode);
  }, [layoutMode]);

  return <Routes />;
}

export default App;

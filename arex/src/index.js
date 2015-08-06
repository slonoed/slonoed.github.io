import React from 'react';

// Global React var to avoid import in each file
window.React = React;

import App from './components/App';

// Render app into dom
React.render(<App />, document.getElementById('root'));

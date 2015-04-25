'use strict';

import React from 'react';
import Router from 'react-router';

import Header from './Header.jsx';
import Footer from './Footer.jsx';

class App extends React.Component {
  render() {
    console.info('Rendering App');
    return (
      <div>
       <Header />
       <Router.RouteHandler />
       <Footer />
      </div>
    );
  }
};

export default App;

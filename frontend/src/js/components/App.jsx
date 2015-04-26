'use strict';

import React from 'react';
import Router from 'react-router';

import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Notification from './Notification.jsx';

class App extends React.Component {
  render() {
    console.info('Rendering App');
    return (
      <div>
       <Header />
         <div className="container">
           <div className="row">
             <Notification />
           </div>
           <Router.RouteHandler />
         </div>
       <Footer />
      </div>
    );
  }
}

export default App;

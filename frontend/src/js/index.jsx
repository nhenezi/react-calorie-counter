'use strict';

import actions from './actions.js';
import stores from './stores/stores.js';
import components from './components/components.js';

console.log('Actions loaded', actions);
console.log('Stores loaded', stores);
console.log('Components loaded', components);

import React from 'react';
import Router from 'react-router';
const Route = Router.Route;


const routes = (
  <Route name="app" path="/" handler={components.App}>
    <Route name="login" path="/login" handler={components.Login} />
    <Route name="register" path="/register" handler={components.Register} />
  </Route>
);

Router.run(routes, function(Handler) {
  React.render(<Handler />, document.body);
});


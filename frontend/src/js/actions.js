'use strict';

import Reflux from 'reflux';

const async_actions = [
  'login',
  'auth',
  'register'
];

exports = {};
async_actions.map(action => {
  exports[action] = Reflux.createAction({asyncResult: true});
});

export default exports;

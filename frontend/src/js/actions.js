'use strict';

import Reflux from 'reflux';

const async_actions = [
  'login',
  'auth',
  'register',

  'loadMeals',
  'createMeal',
  'updateMeal',
  'deleteMeal'
];

exports = {};
async_actions.map(action => {
  exports[action] = Reflux.createAction({asyncResult: true});
});

export default exports;

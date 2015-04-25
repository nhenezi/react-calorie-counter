'use strict';

import Reflux from 'reflux';

const async_actions = [
  'login',
  'auth',
  'register',
  'updateInfo',

  'loadMeals',
  'createMeal',
  'updateMeal',
  'deleteMeal'
];

const actions = [
  'editMeal'
];

exports = {};
async_actions.map(action => {
  exports[action] = Reflux.createAction({asyncResult: true});
});

actions.map(action => {
  exports[action] = Reflux.createAction();
});

export default exports;

'use strict';

import Reflux from 'reflux';
import Utils from '../Utils.js';

import actions from '../actions.js';

const Http = Utils.Http;

var MealStore = Reflux.createStore({
  init: function() {
    this.listenTo(actions.loadMeals, 'loadMeals');
    this.listenTo(actions.createMeal, 'createMeal');
    this.listenTo(actions.updateMeal, 'updateMeal');
    this.listenTo(actions.deleteMeal, 'deleteMeal');
    this.listenTo(actions.editMeal, 'editMeal');
  },

  editMeal: function(meal) {
    console.log('EDIT MEAL', meal);
    this.trigger(meal);
  },

  loadMeals: function() {
    Http.get('meal', actions.loadMeals.completed,
            actions.loadMeals.failed);
  },

  createMeal: function(name, calories, time) {
    const data = {name, calories, time};
    Http.post('meal', data, actions.createMeal.completed,
             actions.createMeal.completed);
  },

  updateMeal: function(meal_id, name=false, calories=false, time=false) {
    let data = {};
    if (name) {
      data.name = name;
    }
    if (calories) {
      data.calories = calories;
    }
    if (time) {
      data.time = time;
    }

    Http.put('meal/' + meal_id, data, actions.updateMeal.completed,
             actions.updateMeal.completed);
  },

  deleteMeal: function(meal_id) {
    Http.delete('meal/' + meal_id, actions.deleteMeal.completed,
             actions.deleteMeal.completed);
  }
});

export default MealStore;

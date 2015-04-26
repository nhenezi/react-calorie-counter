'use strict';

import React from 'react';
import actions from '../actions.js';
import moment from 'moment'
import _ from 'underscore';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meals: [],
      filtered_meals: [],
      user: {},
      filter_meals: {
        from: moment().startOf('day'),
        to: moment().endOf('day').add(1, 'm')
      },
      total_calories: 0
    };

    this.onLoadMeals = this.onLoadMeals.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.onFilterUpdate = this.onFilterUpdate.bind(this);
    this.filterMeals = this.filterMeals.bind(this);
  }

  componentDidMount() {
    this.unsubscribers = [
      actions.loadMeals.completed.listen(this.onLoadMeals),
      actions.createMeal.completed.listen(this.loadMeals),
      actions.updateMeal.completed.listen(this.loadMeals),
      actions.deleteMeal.completed.listen(this.loadMeals),
      actions.login.completed.listen(this.updateUserInfo),
      actions.auth.completed.listen(this.updateUserInfo),
      actions.getUserInfo.listen(this.updateUserInfo),
      actions.updateInfo.completed.listen(this.updateUserInfo)
    ];

    this.loadMeals();
    actions.getUserInfo({});
  }

  onFilterUpdate(from, to) {
    console.debug('Dashboard:onFilterUpdate', this.state, from, to);
    this.setState({
      filter_meals: {
        from: moment(from),
        to: moment(to)
      }
    }, this.filterMeals);
  }

  filterMeals() {
    console.debug('Dashboard:filterMeals', this.state);
    let filtered_meals = _.filter(this.state.meals, meal => {
      return this.state.filter_meals.from <= moment(meal.time) &&
        moment(meal.time) <= this.state.filter_meals.to;
    });
    let total_calories = 0;
    filtered_meals.forEach(m => total_calories += m.calories);
    this.setState({filtered_meals, total_calories});
  }

  updateUserInfo(resp) {
    console.debug('Dashboard:updateUserInfo', resp);
    this.setState({
      user: resp.user
    });
  }

  loadMeals() {
    console.debug('Dashboard:loadMeals');
    actions.loadMeals();
  }

  onLoadMeals(meals) {
    console.debug('Dashboard:onLoadMeals', meals);
    console.log('onLoadMeals', meals);
    this.setState({
      meals: meals
    }, this.filterMeals);
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  render() {
    console.debug('Dashboard:render', this.state, this.props);
    let day_difference = this.state.filter_meals.to.diff(
      this.state.filter_meals.from, 'days'
    );
    day_difference = day_difference > 0 ? day_difference : 1;

    let calorie_status = (
      day_difference * this.state.user.expected_calories - this.state.total_calories
    );
    let day = day_difference > 1 ? 'days' : 'day';

    let message = calorie_status > 0 ?
      <span>
        Your calorie deficit for selected {day_difference} {day} is
        <span className="green"> {calorie_status}</span>
        cal
      </span>
        :
      <span>
        Your calorie surplus for selected {day_difference} {day} is
        <span className="red"> {calorie_status}</span>
        cal
      </span>;

    return (
      <div className="row dashboard">
        <div className="col-sm-3">
          <UserSettings user={this.state.user} />
        </div>
        <div className="col-sm-6">
          <Filter onFilterUpdate={this.onFilterUpdate}/>
          <div className="panel panel-default">
            <div className="panel-heading">
              Meals<span className="pull-right">{message}</span>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-sm-12">
                  <MealTable meals={this.state.filtered_meals}/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-3">
          <MealEditor />
        </div>
      </div>
    );
  }
}

class Filter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter_from: moment().startOf('day').format(TIME_FORMAT),
      filter_to: moment().endOf('day').add(1, 'm').format(TIME_FORMAT)
    };

    this.updateFilterTo = this.updateFilterTo.bind(this);
    this.updateFilterFrom = this.updateFilterFrom.bind(this);
    this.onSubmitHandler = this.onSubmitHandler.bind(this);
  }

  updateFilterFrom(e) {
    this.setState({
      filter_from: e.target.value
    });
  }

  updateFilterTo(e) {
    this.setState({
      filter_to: e.target.value
    });
  }

  onSubmitHandler(e) {
    e.preventDefault();

    if (this.props.onFilterUpdate) {
      this.props.onFilterUpdate(this.state.filter_from,
                              this.state.filter_to);
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col-sm-12">
          <div className="panel panel-default">
            <div className="panel-heading">
              Display meals and calories
            </div>
            <div className="panel-body">
              <form className="form-inline" onSubmit={this.onSubmitHandler}>
                <div className="form-group">
                  <label for="filterFrom">From</label>
                  <input type="text" className="form-control" ref="filterFrom"
                    onChange={this.updateFilterFrom} value={this.state.filter_from}/>
                </div>
                <div className="form-group">
                  <label for="fiterTo">To</label>
                  <input type="text" className="form-control" ref="filterTo"
                    name="filterTo" id="filterTo"
                    onChange={this.updateFilterTo} value={this.state.filter_to}/>
                </div>
                <div className="form-group actions">
                  <button type="submit" className="btn btn-default">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );

  }
}

class UserSettings extends React.Component {
  constructor(props) {
    super(props);

    this.props = {
      user: {
        expected_calories: ""
      }
    };

    this.state = {
      expected_calories: ""
    };

    this.onSubmitHandler = this.onSubmitHandler.bind(this);
    this.updateCalories = this.updateCalories.bind(this);
  }

  updateCalories(e) {
    this.setState({
      expected_calories: e.target.value
    });
  }

  componentWillReceiveProps(obj) {
    console.log('Setting state', this.state, obj);
    this.setState({
      expected_calories: obj.user.expected_calories
    });
  }

  onSubmitHandler(e) {
    e.preventDefault();

    actions.updateInfo(parseInt(this.state.expected_calories, 10));
    actions.notification({text: "Settings updated"});
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          Settings
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-sm-12">
              <form className="form" onSubmit={this.onSubmitHandler}>
                <div className="form-group">
                  <input type="number" ref="calories" placeholder="Expected calories..."
                    className="form-control" onChange={this.updateCalories}
                    value={this.state.expected_calories}>
                  </input>
                </div>
                <div className="form-group">
                  <button type='submit' className="btn btn-default">
                    Update information
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class MealEditor extends React.Component {
  constructor(props) {
    super(props);

    this.onSubmitHandler = this.onSubmitHandler.bind(this);
    this.updateName = this.updateName.bind(this);
    this.updateDate = this.updateDate.bind(this);
    this.updateCalories = this.updateCalories.bind(this);
    this.onEditMeal = this.onEditMeal.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);

    this.state = {
      name: "",
      calories: "",
      time: moment().format(TIME_FORMAT),
      editing: false
    };
  }

  componentDidMount() {
    this.unsubscribers = [
      actions.editMeal.listen(this.onEditMeal)
    ];
  }

  onEditMeal(meal) {
    console.log('IONEDIT', meal);
    this.setState({
      name: meal.name,
      meal_id: meal.id,
      calories: meal.calories,
      time: moment(meal.time).format(TIME_FORMAT),
      editing: true
    });
  }

  cancelEditing(e) {
    e.preventDefault();
    this.setState({
      name: "",
      calories: "",
      time: moment().format(TIME_FORMAT),
      editing: false
    });
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  onSubmitHandler(e) {
    e.preventDefault();
    console.log('handling stuff');

    if (this.state.editing) {
      console.log('Editing meal');
      actions.updateMeal(this.state.meal_id, this.state.name,
                         this.state.calories,
                         moment(this.state.time).format());
      actions.notification({text: "Meal edited"});
    } else {
      console.log('creating meal');
      actions.createMeal(this.state.name, this.state.calories,
                         moment(this.state.time).format());
      actions.notification({text: "Meal creted"});
    }

    this.setState({
      name: "",
      calories: "",
      time: moment().format(TIME_FORMAT),
      editing: false
    });
  }

  updateName(e) {
    this.setState({
      name: e.target.value
    });
  }

  updateDate(e) {
    this.setState({
      time: e.target.value
    });
  }

  updateCalories(e) {
    console.log("Updating calories", parseInt(e.target.value, 10));
    this.setState({
      calories: parseInt(e.target.value, 10)
    });
  }

  render() {
    let title = this.state.editing ? "Edit meal" : "Create new meal";
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          {title}
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-sm-12">
              <form className="form" onSubmit={this.onSubmitHandler}>
                <div className="form-group">
                  <input type="text" ref="name" placeholder="Name.."
                    className="form-control" onChange={this.updateName}
                    value={this.state.name}>
                  </input>
                </div>
                <div className="form-group">
                  <input type="number" ref="calories" className="form-control"
                    placeholder="Number of calories.." onChange={this.updateCalories}
                    value={this.state.calories}>
                  </input>
                </div>
                <div className="form-group">
                  <input type="text" ref="time" className="form-control"
                    onChange={this.updateDate} value={this.state.time}>
                  </input>
                </div>
                <div className="form-group">
                  <button type='submit' className="btn btn-default">
                    Add new meal
                  </button>
                  {
                    this.state.editing ?
                      <button onClick={this.cancelEditing} className="btn btn-danger">
                        Cancel
                      </button>
                      : ''
                  }
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class MealTable extends React.Component {
  constructor(props) {
    super(props);
    this.static = {
      meals: []
    };
  }

  componentDidMount() {
    this.unsubscribers = [
    ];
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  render() {
    console.info('TEST', this.props.meals);
    let meals = this.props.meals.map(meal => {
      return (<MealTableRow meal={meal} key={meal.id} />);
    });
    console.log(meals, this.props.meals);
    return (
      <table className="table table-stripped table-bordered">
        <thead>
          <tr>
            <th>Meal</th>
            <th>#Cal</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {meals}
        </tbody>
      </table>
    );
  }
}

class MealTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.props = {
      name: "",
      calories: "",
      time: ""
    };

    this.deleteMeal = this.deleteMeal.bind(this);
    this.editMeal = this.editMeal.bind(this);
  }

  deleteMeal() {
    actions.deleteMeal(this.props.meal.id);
  }

  editMeal() {
    actions.editMeal(this.props.meal);
  }

  render() {
    return (
      <tr className="mealTableRow">
        <td>{this.props.meal.name}</td>
        <td>{this.props.meal.calories}</td>
        <td>{moment(this.props.meal.time).fromNow()}</td>
        <td>
          <button className="btn btn-default" onClick={this.editMeal}>Edit</button>
          <button className="btn btn-danger" onClick={this.deleteMeal}>Delete</button>
        </td>
      </tr>
    );
  }
}

export default Dashboard;

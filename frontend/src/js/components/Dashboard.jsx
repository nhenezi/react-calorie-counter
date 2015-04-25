'use strict';

import React from 'react';
import actions from '../actions.js';
import moment from 'moment'


class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meals: [],
      user: {},
      total_calories: 0
    };

    this.onLoadMeals = this.onLoadMeals.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
  }

  componentDidMount() {
    this.unsubscribers = [
      actions.loadMeals.completed.listen(this.onLoadMeals),
      actions.createMeal.completed.listen(this.loadMeals),
      actions.updateMeal.completed.listen(this.loadMeals),
      actions.deleteMeal.completed.listen(this.loadMeals),
      actions.login.completed.listen(this.updateUserInfo),
      actions.auth.completed.listen(this.updateUserInfo),
      actions.updateInfo.completed.listen(this.updateUserInfo)
    ];

    this.loadMeals();
  }

  updateUserInfo(resp) {
    console.info("Updating user info");
    this.setState({
      user: resp.user
    });
  }

  loadMeals() {
    actions.loadMeals();
  }

  onLoadMeals(meals) {
    console.log('onLoadMeals', meals);
    let total_calories = 0;
    meals.forEach(m => total_calories += m.calories);
    this.setState({
      meals: meals,
      total_calories: total_calories
    });
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  render() {
    let calorie_status = this.state.user.expected_calories - this.state.total_calories;
    let message = calorie_status > 0 ?
      <h4 className="green">+{calorie_status}</h4> :
      <h4 className="red">{calorie_status}</h4>;
    return (
      <div className="row dashboard">
        <div className="col-sm-3">
          <UserSettings user={this.state.user} />
        </div>
        <div className="col-sm-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              Meals<span className="pull-right">{message}</span>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-sm-12">
                  <MealTable meals={this.state.meals}/>
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

    this.state = {
      name: "",
      calories: "",
      time: moment().format("YYYY-MM-DD HH:MM"),
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
      time: moment(meal.time).format("YYYY-MM-DD HH:MM"),
      editing: true
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
    } else {
      console.log('creating meal');
      actions.createMeal(this.state.name, this.state.calories,
                         moment(this.state.time).format());
    }

    this.setState({
      name: "",
      calories: "",
      time: moment().format('YYYY-MM-DD HH:MM'),
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

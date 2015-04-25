'use strict';

import React from 'react';
import actions from '../actions.js';
import moment from 'moment'


class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meals: []
    };

    this.onLoadMeals = this.onLoadMeals.bind(this);
  }

  componentDidMount() {
    this.unsubscribers = [
      actions.loadMeals.completed.listen(this.onLoadMeals),
      actions.createMeal.completed.listen(this.loadMeals),
      actions.updateMeal.completed.listen(this.loadMeals),
      actions.deleteMeal.completed.listen(this.loadMeals)
    ];

    this.loadMeals();
  }

  loadMeals() {
    actions.loadMeals();
  }

  onLoadMeals(meals) {
    console.log('onLoadMeals', meals);
    this.setState({
      meals: meals
    });
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  render() {
    console.info("MM", this.state.meals);
    return (
      <div className="row">
        <div className="col-sm-6 col-sm-offset-3">
          <div className="panel panel-default">
            <div className="panel-heading">
              Meals
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-sm-12">
                  <MealTable meals={this.state.meals}/>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <button className="btn btn-default">
                    Add new meal
                  </button>
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

class MealEditor extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmitHandler = this.onSubmitHandler.bind(this);
    this.updateName = this.updateName.bind(this);
    this.updateDate = this.updateDate.bind(this);
    this.updateCalories = this.updateCalories.bind(this);

    this.state = {
      name: "",
      calories: "",
      time: moment().format("YYYY-MM-DD HH:MM")
    };
  }

  componentDidMount() {
    this.unsubscribers = [
    ];
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  onSubmitHandler(e) {
    e.preventDefault();
    console.log('handling stuff');

    console.log('creating meal');
    actions.createMeal(this.state.name, this.state.calories,
                       moment(this.state.time).format());

    this.state.name = "";
    this.state.calories = "";
    this.state.time = moment().format('YYYY-MM-DD HH:MM');
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
    let title = "Create new meal";
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
  }

  deleteMeal() {
    actions.deleteMeal(this.props.meal.id);
  }

  render() {
    return (
      <tr>
        <td>{this.props.meal.name}</td>
        <td>{this.props.meal.calories}</td>
        <td>{this.props.meal.time}</td>
        <td>
          <button className="btn btn-default">Edit</button>
          <button className="btn btn-danger" onClick={this.deleteMeal}>Delete</button>
        </td>
      </tr>
    );
  }
}

export default Dashboard;

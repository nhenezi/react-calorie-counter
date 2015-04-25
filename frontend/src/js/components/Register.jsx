'use strict';

import React from 'react';
import actions from '../actions.js';

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valid: true,
      errorMessage: "",
      disabledSubmit: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onRegisterComplete = this.onRegisterComplete.bind(this);
  }

  componentDidMount() {
    this.unsubscribers = [
      actions.register.completed.listen(this.onRegisterComplete)
    ];
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  onRegisterComplete(resp) {
    if (resp.success === false) {
      this.setState({
        valid: false,
        errorMessage: resp.error
      });
    } else {
      this.setState({
        valid: true
      });
      window.location.hash = '#/dashboard';
    }
  }


  handleSubmit(e) {
    e.preventDefault();

    this.setState({
      disabledSubmit: true
    });

    const email = this.refs.email.getDOMNode().value.trim();
    const password = this.refs.password.getDOMNode().value.trim();

    actions.register(email, password);
  }

  render() {
    let error = this.state.valid ? '' : (
      <div className="alert alert-danger">
         {this.state.errorMessage}
      </div>
    );
    let btn_class = this.state.disabledSubmit ? 'disabled' : '';

    return (
      <div className="col-sm-6 col-sm-offset-3">
        <h3>Create new account</h3>
        <form name="RegistrationForm" onSubmit={this.handleSubmit}
          className="registrationForm">
          {error}
          <div className="form-group">
            <input type="email" className="form-control" ref="email"
              placeholder="Email..."/>
          </div>
          <div className="form-group">
            <input type="password" className="form-control" ref="password"
              placeholder="Password..."/>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">Create new account</button>
            or <a href="#/Login"> log in with existing account</a>
          </div>
        </form>
      </div>
    );
  }
}

export default Register

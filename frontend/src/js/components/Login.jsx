'use strict';

import React from 'react';

import actions from '../actions.js';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      valid: true,
      errorMessage: "",
      disabledSubmit: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onLoginComplete = this.onLoginComplete.bind(this);
  }

  componentDidMount() {
    this.unsubscribers = [
      actions.login.completed.listen(this.onLoginComplete)
    ];
  }

  componentWillUnmount() {
    console.log('unsubscribing Login..');
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  onLoginComplete(resp) {
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
    console.log(email, password);

    if (!email || !password) {
      return;
    }

    actions.login(email, password);
  }

  render() {
    console.info('Rendering Login');
    let error = this.state.valid ? '' :
      (
      <div className="alert alert-danger">
         {this.state.errorMessage}
      </div>
    );

    var btn_class = this.state.disabledSubmit ? 'disabled': '';
    return (
      <div className="col-sm-6 col-sm-offset-3">
        <h3>Sign in to your Calorie Counter account</h3>
        <form name="LoginForm" onSubmit={this.handleSubmit}
          className="loginForm">
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
            <button type="submit" className="btn btn-primary">Sign in</button>
            or <a href="#/Register">create new account</a>
          </div>
        </form>
      </div>
    );
  }
}

export default Login;

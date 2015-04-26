'use strict';

import React from 'react';
import actions from '../actions.js';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        email: "",
        expected_calories: ""
      }
    };

    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    this.unsubscribers = [
      actions.login.completed.listen(this.updateUserInfo),
      actions.auth.completed.listen(this.updateUserInfo)
    ];
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }

  updateUserInfo(resp) {
    console.debug('Header:updateUserInfo', resp);
    if (resp.success === true) {
      this.setState({
        user: resp.user
      });
    }
  }

  logout(e) {
    e.preventDefault();
    actions.logout();
    this.setState({
      user: {
        email: ""
      }
    });
  }

  render() {
    let logout = this.state.user.id ?
      <a href="#/Logout" onClick={this.logout}>Logout</a> : '';
    return (
      <header>
        <div className="container">
          <div className="row">
            <div className="col-sm-2">
              <h4>Calorie Counter</h4>
            </div>
            <div className="col-sm-2 col-sm-offset-7">
              {this.state.user.email}
            </div>
            <div className="col-sm-1">
              {logout}
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;

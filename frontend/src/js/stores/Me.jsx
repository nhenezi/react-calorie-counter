'use strict';

import Reflux from 'reflux';
import Cookies from 'cookies-js';
import Utils from '../Utils.js';

import actions from '../actions.js';

const Http = Utils.Http;

var MeStore = Reflux.createStore({
  init: function() {
    this.listenTo(actions.login, 'login');
    this.listenTo(actions.register, 'register');
    this.listenTo(actions.updateInfo, 'updateInfo');
    this.listenTo(actions.logout, 'logout');
    this.listenTo(actions.getUserInfo, 'getUserInfo');

    actions.login.completed.listen(this.onLogin);
    actions.register.completed.listen(this.onLogin);
    actions.auth.completed.listen(this.onAuth);
    this.authenticate();

    this.access_token = false;
    this.logged_in = false;
    this.data = {};
  },

  getUserInfo: function(resp) {
    resp.user = this.data;
    this.trigger();
  },

  onLogin: function(resp) {
    if (resp.success === false) {
      return;
    }

    this.access_token = resp.user.access_token;
    this.data = resp.user;
    this.logged_in = true;
  },

  onAuth: function(resp) {
    if (resp.success === true) {
      this.access_token = Cookies.get('access_token');
      this.logged_in = true;
      this.data = resp.user;
    } else {
      window.location.hash = '#/Login';
    }
  },

  login: function(email, password) {
    const data = {email, password};
    Http.post('auth', data, actions.login.completed,
             actions.login.failed);
  },

  logout: function() {
    Cookies.expire('access_token');
    actions.logout.completed();
    window.location.hash = '#/Login';
  },

  register: function(email, password) {
    const data = {email, password};
    Http.post('user', data, actions.register.completed,
              actions.register.failed);
  },

  updateInfo: function(expected_calories) {
    const data = {expected_calories};
    Http.put('user', data, actions.updateInfo.completed,
            actions.updateInfo.failed);
  },

  authenticate: function() {
    const access_token = Cookies.get('access_token');

    console.log('Authenticating user');
    Http.get('auth?access_token=' + access_token,
             actions.auth.completed,
             actions.auth.failed);
  }
});

'use strict';

import React from 'react';
import actions from '../actions.js'
import _ from 'underscore';
import moment from 'moment';

class Notification extends React.Component {
  constructor(props) {
    super(props);

    this.TIMEOUT = 3 * 1000; // 3 sec
    this.state = {
      messages: [],
      nextMessage: 0
    };

    this.addNotification = this.addNotification.bind(this);
    this.removeNotification = this.removeNotification.bind(this);
  }

  addNotification(message) {
    let messages = this.state.messages;
    message.id = this.state.nextMessage;
    messages.push(message);
    this.setState({messages, nextMessage: this.state.nextMessage++});
    setTimeout(() => {
      this.removeNotification(message);
    }, this.TIMEOUT);
  }

  removeNotification(message) {
    console.debug('Notification:removeNotification', message);
    let messages = this.state.messages;
    messages = _.filter(messages, m => {
      return message.id !== m.id;
    });
    this.setState({messages});
  }

  componentDidMount() {
    this.unsubscribers = [
      actions.notification.listen(this.addNotification)
    ];
  }

  componentWillUnmount() {
    this.unsubscribers.map(unsubscribe => unsubscribe());
  }



  render() {
    let messages = this.state.messages.map(m => {
      return (
        <div className="col-sm-12 alert alert-success">
          {m.text}
        </div>
      );
    });

    return (
      <div className="col-sm-2 notifications">
        {messages}
      </div>
    );
  }
}

export default Notification

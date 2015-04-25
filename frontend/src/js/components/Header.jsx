'use strict';

import React from 'react';

class Header extends React.Component {
  render() {
    return (
      <header>
          <div className="row">
            <div className="col-md-2">
              <h4>Calorie Counter</h4>
            </div>
          </div>
      </header>
    )
  }
};

export default Header;

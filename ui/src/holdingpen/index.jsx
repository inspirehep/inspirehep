import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import DashboardPage from './containers/DashboardPage';
import SearchPage from './containers/SearchPage';
import ExceptionsPage from './containers/ExceptionsPage';

class Holdingpen extends Component {
  render() {
    return (
      <div>
        <Route exact path="/holdingpen" component={SearchPage} />
        <Route exact path="/holdingpen/dashboard" component={DashboardPage} />
        <Route exact path="/holdingpen/exceptions" component={ExceptionsPage} />
      </div>
    );
  }
}

export default Holdingpen;

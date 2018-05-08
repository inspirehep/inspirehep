import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import DashboardPage from './containers/DashboardPage';
import SearchPage from './containers/SearchPage';
import ExceptionsDashboardPage from './containers/ExceptionsDashboardPage';

class Holdingpen extends Component {
  render() {
    return (
      <div>
        <Route exact path="/holdingpen" component={SearchPage} />
        <Route exact path="/holdingpen/dashboard" component={DashboardPage} />
        <Route
          exact
          path="/holdingpen/exceptions-dashboard"
          component={ExceptionsDashboardPage}
        />
      </div>
    );
  }
}

export default Holdingpen;

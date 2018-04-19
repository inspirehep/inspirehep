import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import DashboardPage from './containers/DashboardPage';
import SearchPage from './containers/SearchPage';

class Holdingpen extends Component {
  render() {
    return (
      <div>
        <Route exact path="/holdingpen" component={SearchPage} />
        <Route exact path="/holdingpen/dashboard" component={DashboardPage} />
      </div>
    );
  }
}

export default Holdingpen;

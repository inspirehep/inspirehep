import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import DashboardPage from './containers/DashboardPage';
import SearchPage from './containers/SearchPage';
import ExceptionsPage from './containers/ExceptionsPage';
import InspectPage from './containers/InspectPage';

class Holdingpen extends Component {
  render() {
    return (
      <div className="w-100">
        <Route exact path="/holdingpen" component={SearchPage} />
        <Route exact path="/holdingpen/dashboard" component={DashboardPage} />
        <Route exact path="/holdingpen/exceptions" component={ExceptionsPage} />
        <Route exact path="/holdingpen/inspect/:id" component={InspectPage} />
      </div>
    );
  }
}

export default Holdingpen;

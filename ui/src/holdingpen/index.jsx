import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import DashboardPage from './containers/DashboardPage';
import ExceptionsPage from './containers/ExceptionsPage';
import InspectPage from './containers/InspectPage';

import {
  HOLDINGPEN_DASHBOARD,
  HOLDINGPEN_EXCEPTIONS,
  HOLDINGPEN_INSPECT,
} from '../common/routes';

class Holdingpen extends Component {
  render() {
    return (
      <div className="w-100">
        <Route exact path={HOLDINGPEN_DASHBOARD} component={DashboardPage} />
        <Route exact path={HOLDINGPEN_EXCEPTIONS} component={ExceptionsPage} />
        <Route
          exact
          path={`${HOLDINGPEN_INSPECT}/:id`}
          component={InspectPage}
        />
      </div>
    );
  }
}

export default Holdingpen;

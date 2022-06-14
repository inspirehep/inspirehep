import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route, Redirect } from 'react-router-dom';

import DashboardPageContainer from './containers/DashboardPageContainer';
import ExceptionsPageContainer from './containers/ExceptionsPageContainer';
import InspectPageContainer from './containers/InspectPageContainer';
import {
  HOLDINGPEN_DASHBOARD,
  HOLDINGPEN_EXCEPTIONS,
  HOLDINGPEN_INSPECT,
  HOLDINGPEN,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';

class Holdingpen extends Component {
  render() {
    return (
      <div className="w-100">
        {/* @ts-expect-error ts-migrate(2559) FIXME: Type '{ children: Element[]; }' has no properties ... Remove this comment to see the full error message */}
        <SafeSwitch>
          <Redirect exact from={HOLDINGPEN} to={HOLDINGPEN_DASHBOARD} />
          <Route
            exact
            path={HOLDINGPEN_DASHBOARD}
            component={DashboardPageContainer}
          />
          <Route
            exact
            path={HOLDINGPEN_EXCEPTIONS}
            component={ExceptionsPageContainer}
          />
          <Route
            exact
            path={`${HOLDINGPEN_INSPECT}/:id`}
            component={InspectPageContainer}
          />
        </SafeSwitch>
      </div>
    );
  }
}

export default Holdingpen;

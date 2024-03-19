import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import DashboardPage from './containers/DashboardPageContainer/DashboardPageContainer';
import DetailPageContainer from './containers/DetailPageContainer/DetailPageContainer';
import SearchPageContainer from './containers/SearchPageContainer/SearchPageContainer';
import {
  HOLDINGPEN_DASHBOARD,
  HOLDINGPEN,
  HOLDINGPEN_SEARCH,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';

const Holdingpen = () => {
  return (
    <div className="w-100" data-testid="holdingpen">
      <SafeSwitch>
        <Redirect exact from={HOLDINGPEN} to={HOLDINGPEN_DASHBOARD} />
        <Route exact path={HOLDINGPEN_DASHBOARD} component={DashboardPage} />
        <Route
          exact
          path={`${HOLDINGPEN_SEARCH}`}
          component={SearchPageContainer}
        />
        <Route
          exact
          path={`${HOLDINGPEN}/:id`}
          component={DetailPageContainer}
        />
      </SafeSwitch>
    </div>
  );
};

export default Holdingpen;

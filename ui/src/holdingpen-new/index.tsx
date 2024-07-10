import React from 'react';
import { Redirect } from 'react-router-dom';

import DashboardPage from './containers/DashboardPageContainer/DashboardPageContainer';
import DetailPageContainer from './containers/DetailPageContainer/DetailPageContainer';
import SearchPageContainer from './containers/SearchPageContainer/SearchPageContainer';
import {
  HOLDINGPEN_NEW,
  HOLDINGPEN_DASHBOARD_NEW,
  HOLDINGPEN_SEARCH_NEW,
  HOLDINGPEN_LOGIN_NEW,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';
import AuthorDetailPageContainer from './containers/DetailPageContainer/AuthorDetailPageContainer';
import DocumentHead from '../common/components/DocumentHead';
import LoginPageContainer from './containers/LoginPageContainer/LoginPageContainer';
import storage from '../common/storage';
import PrivateRoute from '../common/PrivateRoute';

const META_DESCRIPTION = 'Tool for curators to manage submissions and harvests';
const TITLE = 'Holdingpen';

const Holdingpen = () => {
  const loggedIn = !!storage.getSync('holdingpen.token');

  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <div className="w-100" data-testid="holdingpen-new">
        <SafeSwitch>
          <PrivateRoute
            exact
            path={HOLDINGPEN_LOGIN_NEW}
            component={LoginPageContainer}
          />
          <Redirect exact from={HOLDINGPEN_NEW} to={HOLDINGPEN_DASHBOARD_NEW} />
          <PrivateRoute
            exact
            path={HOLDINGPEN_DASHBOARD_NEW}
            component={DashboardPage}
            isHoldinpen
            loggedInToHoldinpen={loggedIn}
          />
          <PrivateRoute
            exact
            path={`${HOLDINGPEN_SEARCH_NEW}`}
            component={SearchPageContainer}
            isHoldinpen
            loggedInToHoldinpen={loggedIn}
          />
          <PrivateRoute
            exact
            path={`${HOLDINGPEN_NEW}/:id`}
            component={DetailPageContainer}
            isHoldinpen
            loggedInToHoldinpen={loggedIn}
          />
          <PrivateRoute
            exact
            path={`${HOLDINGPEN_NEW}/author/:id`}
            component={AuthorDetailPageContainer}
            isHoldinpen
            loggedInToHoldinpen={loggedIn}
          />
        </SafeSwitch>
      </div>
    </>
  );
};

export default Holdingpen;

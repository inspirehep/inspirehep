import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import DashboardPage from './containers/DashboardPageContainer/DashboardPageContainer';
import DetailPageContainer from './containers/DetailPageContainer/DetailPageContainer';
import SearchPageContainer from './containers/SearchPageContainer/SearchPageContainer';
import {
  HOLDINGPEN_NEW,
  HOLDINGPEN_DASHBOARD_NEW,
  HOLDINGPEN_SEARCH_NEW,
} from '../common/routes';
import SafeSwitch from '../common/components/SafeSwitch';
import AuthorDetailPageContainer from './containers/DetailPageContainer/AuthorDetailPageContainer';
import DocumentHead from '../common/components/DocumentHead';

const META_DESCRIPTION = 'Tool for curators to manage submissions and harvests';
const TITLE = 'Holdingpen';

const Holdingpen = () => {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <div className="w-100" data-testid="holdingpen-new">
        <SafeSwitch>
          <Redirect exact from={HOLDINGPEN_NEW} to={HOLDINGPEN_DASHBOARD_NEW} />
          <Route
            exact
            path={HOLDINGPEN_DASHBOARD_NEW}
            component={DashboardPage}
          />
          <Route
            exact
            path={`${HOLDINGPEN_SEARCH_NEW}`}
            component={SearchPageContainer}
          />
          <Route
            exact
            path={`${HOLDINGPEN_NEW}/:id`}
            component={DetailPageContainer}
          />
          <Route
            exact
            path={`${HOLDINGPEN_NEW}/author/:id`}
            component={AuthorDetailPageContainer}
          />
        </SafeSwitch>
      </div>
    </>
  );
};

export default Holdingpen;

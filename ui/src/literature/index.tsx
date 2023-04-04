import React from 'react';
import { Route } from 'react-router-dom';

import './index.less';
import { ERROR_401, LITERATURE } from '../common/routes';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';
import ReferenceDiffInterfaceContainer from './containers/ReferenceDiffInterfaceContainer';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';
import SafeSwitch from '../common/components/SafeSwitch';
import PrivateRoute from '../common/PrivateRoute';

function Literature() {
  return (
    <div className="__Literature__" data-testid="literature">
      <SafeSwitch>
        <Route exact path={LITERATURE} component={SearchPageContainer} />
        <Route
          exact
          path={`${LITERATURE}/:id`}
          component={DetailPageContainer}
        />
        <PrivateRoute
          redirectTo={ERROR_401}
          path={`${LITERATURE}/:id/diff/:old..:new`}
          authorizedRoles={SUPERUSER_OR_CATALOGER}
          component={ReferenceDiffInterfaceContainer}
        />
      </SafeSwitch>
    </div>
  );
}

export default Literature;

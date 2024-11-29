import React from 'react';
import { Route } from 'react-router-dom';

import './index.less';
import { DATA } from '../common/routes';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

import SafeSwitch from '../common/components/SafeSwitch';

function Data() {
  return (
    <div className="__Data__ w-100" data-testid="data">
      <SafeSwitch>
        <Route exact path={DATA} component={SearchPageContainer} />
        <Route
          exact
          path={`${DATA}/:id`}
          component={DetailPageContainer}
        />

      </SafeSwitch>
    </div>
  );
}

export default Data;

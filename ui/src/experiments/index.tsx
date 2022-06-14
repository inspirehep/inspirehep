import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route } from 'react-router-dom';

import { EXPERIMENTS } from '../common/routes';

import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Experiments extends Component {
  render() {
    return (
      <div className="w-100">
        <Route exact path={EXPERIMENTS} component={SearchPageContainer} />
        <Route
          exact
          path={`${EXPERIMENTS}/:id`}
          component={DetailPageContainer}
        />
      </div>
    );
  }
}

export default Experiments;

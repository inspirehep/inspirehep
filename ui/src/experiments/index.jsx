import React, { Component } from 'react';
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

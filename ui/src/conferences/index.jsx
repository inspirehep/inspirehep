import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import { CONFERENCES } from '../common/routes';

import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Conferences extends Component {
  render() {
    return (
      <div className="w-100">
        <Route exact path={CONFERENCES} component={SearchPageContainer} />
        <Route
          exact
          path={`${CONFERENCES}/:id`}
          component={DetailPageContainer}
        />
      </div>
    );
  }
}

export default Conferences;

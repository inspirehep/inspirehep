import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import { INSTITUTIONS } from '../common/routes';

import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Institutions extends Component {
  render() {
    return (
      <div className="w-100">
        <Route exact path={INSTITUTIONS} component={SearchPageContainer} />
        <Route
          exact
          path={`${INSTITUTIONS}/:id`}
          component={DetailPageContainer}
        />
      </div>
    );
  }
}

export default Institutions;

import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import { SEMINARS } from '../common/routes';

import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Seminars extends Component {
  render() {
    return (
      <div className="w-100">
        <Route exact path={SEMINARS} component={SearchPageContainer} />
        <Route exact path={`${SEMINARS}/:id`} component={DetailPageContainer} />
      </div>
    );
  }
}

export default Seminars;

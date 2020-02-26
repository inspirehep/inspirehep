import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import { JOBS } from '../common/routes';
import './index.scss';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Jobs extends Component {
  render() {
    return (
      <div className="__Jobs__">
        <Route exact path={JOBS} component={SearchPageContainer} />
        <Route exact path={`${JOBS}/:id`} component={DetailPageContainer} />
      </div>
    );
  }
}

export default Jobs;

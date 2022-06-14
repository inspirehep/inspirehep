import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route } from 'react-router-dom';

import { AUTHORS } from '../common/routes';
import './index.scss';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Authors extends Component {
  render() {
    return (
      <div className="__Authors__">
        <Route exact path={AUTHORS} component={SearchPageContainer} />
        <Route exact path={`${AUTHORS}/:id`} component={DetailPageContainer} />
      </div>
    );
  }
}

export default Authors;

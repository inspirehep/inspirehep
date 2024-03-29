import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import { AUTHORS } from '../common/routes';
import './index.less';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Authors extends Component {
  render() {
    return (
      <div className="__Authors__" data-testid="authors">
        {/* @ts-ignore */}
        <Route exact path={AUTHORS} component={SearchPageContainer} />
        <Route exact path={`${AUTHORS}/:id`} component={DetailPageContainer} />
      </div>
    );
  }
}

export default Authors;

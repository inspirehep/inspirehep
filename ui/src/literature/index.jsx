import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import './index.less';
import { LITERATURE } from '../common/routes';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Literature extends Component {
  render() {
    return (
      <div className="__Literature__">
        <Route exact path={LITERATURE} component={SearchPageContainer} />
        <Route
          exact
          path={`${LITERATURE}/:id`}
          component={DetailPageContainer}
        />
      </div>
    );
  }
}

export default Literature;

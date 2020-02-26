import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import './index.scss';
import { LITERATURE } from '../common/routes';
import SearchPage from './containers/SearchPage';
import DetailPageContainer from './containers/DetailPageContainer';

class Literature extends Component {
  render() {
    return (
      <div className="__Literature__">
        <Route exact path={LITERATURE} component={SearchPage} />
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

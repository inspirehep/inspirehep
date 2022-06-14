import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route } from 'react-router-dom';

import './index.scss';
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

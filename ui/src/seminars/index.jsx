import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import { SEMINARS } from '../common/routes';

import SearchPage from './components/SearchPage';
import DetailPageContainer from './containers/DetailPageContainer';

class Seminars extends Component {
  render() {
    return (
      <div className="w-100">
        <Route exact path={SEMINARS} component={SearchPage} />
        <Route exact path={`${SEMINARS}/:id`} component={DetailPageContainer} />
      </div>
    );
  }
}

export default Seminars;

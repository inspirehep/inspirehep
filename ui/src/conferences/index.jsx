import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import { CONFERENCES } from '../common/routes';
import Loading from '../common/components/Loading';

const SearchPage$ = Loadable({
  loader: () => import('./containers/SearchPageContainer'),
  loading: Loading,
});
const DetailPage$ = Loadable({
  loader: () => import('./containers/DetailPageContainer'),
  loading: Loading,
});

class Conferences extends Component {
  render() {
    return (
      <div className="w-100">
        <Route exact path={CONFERENCES} component={SearchPage$} />
        <Route exact path={`${CONFERENCES}/:id`} component={DetailPage$} />
      </div>
    );
  }
}

export default Conferences;

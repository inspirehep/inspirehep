import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import { JOBS } from '../common/routes';
import Loading from '../common/components/Loading';
import './index.scss';

const SearchPage$ = Loadable({
  loader: () => import('./containers/SearchPage'),
  loading: Loading,
});
const DetailPage$ = Loadable({
  loader: () => import('./containers/DetailPage'),
  loading: Loading,
});

class Jobs extends Component {
  render() {
    return (
      <div className="__Jobs__">
        <Route exact path={JOBS} component={SearchPage$} />
        <Route exact path={`${JOBS}/:id`} component={DetailPage$} />
      </div>
    );
  }
}

export default Jobs;

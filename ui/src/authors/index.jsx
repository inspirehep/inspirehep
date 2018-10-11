import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import { AUTHORS } from '../common/routes';
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

class Authors extends Component {
  render() {
    return (
      <div className="__Authors__">
        <Route exact path={AUTHORS} component={SearchPage$} />
        <Route exact path={`${AUTHORS}/:id`} component={DetailPage$} />
      </div>
    );
  }
}

export default Authors;

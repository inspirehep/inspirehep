import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import Loading from '../common/components/Loading';
import './index.scss';
import { LITERATURE } from '../common/routes';

const SearchPage$ = Loadable({
  loader: () => import('./containers/SearchPage'),
  loading: Loading,
});
const DetailPage$ = Loadable({
  loader: () => import('./containers/DetailPage'),
  loading: Loading,
});

class Literature extends Component {
  render() {
    return (
      <div className="__Literature__">
        <Route exact path={LITERATURE} component={SearchPage$} />
        <Route exact path={`${LITERATURE}/:id`} component={DetailPage$} />
      </div>
    );
  }
}

export default Literature;

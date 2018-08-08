import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import Loading from '../common/components/Loading';
import './index.scss';

const SearchPage$ = Loadable({
  loader: () => import('./containers/AuthorSubmissionPage'),
  loading: Loading,
});

class Submissions extends Component {
  render() {
    return (
      <div className="__Submissions__">
        <Route exact path="/submissions/author" component={SearchPage$} />
      </div>
    );
  }
}

export default Submissions;

import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import Loading from '../common/components/Loading';
import './index.scss';

const AuthorSubmissionPage$ = Loadable({
  loader: () => import('./containers/AuthorSubmissionPage'),
  loading: Loading,
});

const SubmissionSuccessPage$ = Loadable({
  loader: () => import('./containers/SubmissionSuccessPage'),
  loading: Loading,
});

class Submissions extends Component {
  render() {
    return (
      <div className="__Submissions__ w-100">
        <Route
          exact
          path="/submissions/author"
          component={AuthorSubmissionPage$}
        />
        <Route
          exact
          path="/submissions/success"
          component={SubmissionSuccessPage$}
        />
      </div>
    );
  }
}

export default Submissions;

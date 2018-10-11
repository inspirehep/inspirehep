import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Loadable from 'react-loadable';

import { AUTHOR_SUBMISSION, SUBMISSION_SUCCESS } from '../common/routes';
import Loading from '../common/components/Loading';

const AuthorSubmissionPage$ = Loadable({
  loader: () => import('./containers/AuthorSubmissionPage'),
  loading: Loading,
});

const AuthorUpdateSubmissionPage$ = Loadable({
  loader: () => import('./containers/AuthorUpdateSubmissionPage'),
  loading: Loading,
});

const SubmissionSuccessPage$ = Loadable({
  loader: () => import('./components/SubmissionSuccessPage'),
  loading: Loading,
});

class Submissions extends Component {
  render() {
    return (
      <div className="w-100">
        <Route
          exact
          path={AUTHOR_SUBMISSION}
          component={AuthorSubmissionPage$}
        />
        <Route
          exact
          path={`${AUTHOR_SUBMISSION}/:id`}
          component={AuthorUpdateSubmissionPage$}
        />
        <Route
          exact
          path={SUBMISSION_SUCCESS}
          component={SubmissionSuccessPage$}
        />
      </div>
    );
  }
}

export default Submissions;

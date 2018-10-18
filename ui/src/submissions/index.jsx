import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';

import {
  SUBMISSIONS_AUTHOR,
  SUBMISSION_SUCCESS,
  SUBMISSIONS,
} from '../common/routes';
import Loading from '../common/components/Loading';
import SafeSwitch from '../common/components/SafeSwitch';

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
        <SafeSwitch>
          <Redirect exact from={SUBMISSIONS} to={SUBMISSIONS_AUTHOR} />
          <Route
            exact
            path={SUBMISSIONS_AUTHOR}
            component={AuthorSubmissionPage$}
          />
          <Route
            exact
            path={`${SUBMISSIONS_AUTHOR}/:id`}
            component={AuthorUpdateSubmissionPage$}
          />
          <Route
            exact
            path={SUBMISSION_SUCCESS}
            component={SubmissionSuccessPage$}
          />
        </SafeSwitch>
      </div>
    );
  }
}

export default Submissions;

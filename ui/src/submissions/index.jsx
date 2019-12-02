import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';

import {
  SUBMISSIONS_AUTHOR,
  SUBMISSIONS_JOB,
  SUBMISSIONS,
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_CONFERENCE,
  SUBMISSION_SUCCESS,
} from '../common/routes';

import Loading from '../common/components/Loading';
import SafeSwitch from '../common/components/SafeSwitch';
import DocumentHead from '../common/components/DocumentHead';

const AuthorSubmissionPage$ = Loadable({
  loader: () => import('./authors/containers/AuthorSubmissionPageContainer'),
  loading: Loading,
});

const AuthorUpdateSubmissionPage$ = Loadable({
  loader: () =>
    import('./authors/containers/AuthorUpdateSubmissionPageContainer'),
  loading: Loading,
});

const LiteratureSubmissionPage$ = Loadable({
  loader: () =>
    import('./literature/containers/LiteratureSubmissionPageContainer'),
  loading: Loading,
});

const JobSubmissionPage$ = Loadable({
  loader: () => import('./jobs/containers/JobSubmissionPageContainer'),
  loading: Loading,
});

const JobUpdateSubmissionPage$ = Loadable({
  loader: () => import('./jobs/containers/JobUpdateSubmissionPageContainer'),
  loading: Loading,
});

const SubmissionSuccessPage$ = Loadable({
  loader: () => import('./common/components/SubmissionSuccessPage'),
  loading: Loading,
});

const JobUpdateSubmissionSuccessPage$ = Loadable({
  loader: () => import('./jobs/components/JobUpdateSubmissionSuccessPage'),
  loading: Loading,
});

const ConferenceSubmissionPage$ = Loadable({
  loader: () =>
    import('./conferences/containers/ConferenceSubmissionPageContainer'),
  loading: Loading,
});

const ConferenceSubmissionsSuccessPage$ = Loadable({
  loader: () =>
    import('./conferences/containers/ConferenceSubmissionSuccessPageContainer'),
  loading: Loading,
});

class Submissions extends Component {
  render() {
    return (
      <>
        <DocumentHead title="Submit" />
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
              path={SUBMISSIONS_LITERATURE}
              component={LiteratureSubmissionPage$}
            />
            <Route
              exact
              path={SUBMISSIONS_JOB}
              component={JobSubmissionPage$}
            />
            <Route
              exact
              path={`${SUBMISSIONS_JOB}/:id`}
              component={JobUpdateSubmissionPage$}
            />
            <Route
              exact
              path={SUBMISSIONS_CONFERENCE}
              component={ConferenceSubmissionPage$}
            />
            <Redirect
              exact
              from={`${SUBMISSIONS_AUTHOR}/:id/success`}
              to={SUBMISSION_SUCCESS}
            />
            <Redirect
              exact
              from={`${SUBMISSIONS_AUTHOR}/new/success`}
              to={SUBMISSION_SUCCESS}
            />
            <Redirect
              exact
              from={`${SUBMISSIONS_LITERATURE}/new/success`}
              to={SUBMISSION_SUCCESS}
            />
            <Redirect
              exact
              from={`${SUBMISSIONS_JOB}/new/success`}
              to={SUBMISSION_SUCCESS}
            />
            <Route
              exact
              path={`${SUBMISSIONS_JOB}/:id/success`}
              component={JobUpdateSubmissionSuccessPage$}
            />
            <Route
              exact
              path={`${SUBMISSIONS_CONFERENCE}/new/success`}
              component={ConferenceSubmissionsSuccessPage$}
            />

            <Route
              exact
              path={SUBMISSION_SUCCESS}
              component={SubmissionSuccessPage$}
            />
          </SafeSwitch>
        </div>
      </>
    );
  }
}

export default Submissions;

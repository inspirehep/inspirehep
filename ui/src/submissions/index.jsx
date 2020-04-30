import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

import {
  SUBMISSIONS_AUTHOR,
  SUBMISSIONS_JOB,
  SUBMISSIONS,
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_CONFERENCE,
  SUBMISSION_SUCCESS,
  SUBMISSIONS_SEMINAR,
} from '../common/routes';

import SafeSwitch from '../common/components/SafeSwitch';
import DocumentHead from '../common/components/DocumentHead';
import AuthorSubmissionPageContainer from './authors/containers/AuthorSubmissionPageContainer';
import AuthorUpdateSubmissionPageContainer from './authors/containers/AuthorUpdateSubmissionPageContainer';
import LiteratureSubmissionPageContainer from './literature/containers/LiteratureSubmissionPageContainer';
import JobSubmissionPageContainer from './jobs/containers/JobSubmissionPageContainer';
import JobUpdateSubmissionPageContainer from './jobs/containers/JobUpdateSubmissionPageContainer';
import ConferenceSubmissionPageContainer from './conferences/containers/ConferenceSubmissionPageContainer';
import JobUpdateSubmissionSuccessPage from './jobs/components/JobUpdateSubmissionSuccessPage';
import ConferenceSubmissionSuccessPageContainer from './conferences/containers/ConferenceSubmissionSuccessPageContainer';
import SubmissionSuccessPage from './common/components/SubmissionSuccessPage';
import SeminarSubmissionPageContainer from './seminars/containers/SeminarSubmissionPageContainer';
import SeminarUpdateSubmissionPageContainer from './seminars/containers/SeminarUpdateSubmissionPageContainer';

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
              component={AuthorSubmissionPageContainer}
            />
            <Route
              exact
              path={`${SUBMISSIONS_AUTHOR}/:id`}
              component={AuthorUpdateSubmissionPageContainer}
            />

            <Route
              exact
              path={SUBMISSIONS_LITERATURE}
              component={LiteratureSubmissionPageContainer}
            />
            <Route
              exact
              path={SUBMISSIONS_JOB}
              component={JobSubmissionPageContainer}
            />
            <Route
              exact
              path={`${SUBMISSIONS_JOB}/:id`}
              component={JobUpdateSubmissionPageContainer}
            />
            <Route
              exact
              path={SUBMISSIONS_CONFERENCE}
              component={ConferenceSubmissionPageContainer}
            />
            <Route
              exact
              path={SUBMISSIONS_SEMINAR}
              component={SeminarSubmissionPageContainer}
            />
            <Route
              exact
              path={`${SUBMISSIONS_SEMINAR}/:id`}
              component={SeminarUpdateSubmissionPageContainer}
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
              from={`${SUBMISSIONS_SEMINAR}/:id/success`}
              to={SUBMISSION_SUCCESS}
            />
            <Redirect
              exact
              from={`${SUBMISSIONS_SEMINAR}/new/success`}
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
              component={JobUpdateSubmissionSuccessPage}
            />
            <Route
              exact
              path={`${SUBMISSIONS_CONFERENCE}/new/success`}
              component={ConferenceSubmissionSuccessPageContainer}
            />

            <Route
              exact
              path={SUBMISSION_SUCCESS}
              component={SubmissionSuccessPage}
            />
          </SafeSwitch>
        </div>
      </>
    );
  }
}

export default Submissions;

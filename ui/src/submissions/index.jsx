import { Component } from 'react';
import { Route, Navigate } from 'react-router-dom';

import { SUBMISSIONS_AUTHOR, SUBMISSION_SUCCESS } from '../common/routes';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';
import RequireAuth from '../common/RequireAuth';
import RoutesWithFallback from '../common/components/RoutesWithFallback';
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
import SeminarSubmissionSuccessPageContainer from './seminars/containers/SeminarSubmissionSuccessPageContainer';
import AuthorUpdateSubmissionSuccessPage from './authors/components/AuthorUpdateSubmissionSuccessPage';
import InstitutionSubmissionPageContainer from './institutions/containers/InstitutionSubmissionPageContainer';
import ExperimentSubmissionPageContainer from './experiments/containers/ExperimentSubmissionPageContainer';
import JournalSubmissionPageContainer from './journals/containers/JournalSubmissionPageContainer';

class Submissions extends Component {
  render() {
    return (
      <>
        <DocumentHead title="Submit" />
        <div className="w-100" data-testid="submissions">
          <RoutesWithFallback>
            <Route
              index
              element={<Navigate to={SUBMISSIONS_AUTHOR} replace />}
            />
            <Route path="authors" element={<AuthorSubmissionPageContainer />} />
            <Route
              path="authors/:id"
              element={<AuthorUpdateSubmissionPageContainer />}
            />
            <Route
              path="literature"
              element={<LiteratureSubmissionPageContainer />}
            />
            <Route path="jobs" element={<JobSubmissionPageContainer />} />
            <Route
              path="jobs/:id"
              element={<JobUpdateSubmissionPageContainer />}
            />
            <Route
              path="conferences"
              element={<ConferenceSubmissionPageContainer />}
            />
            <Route
              path="seminars"
              element={<SeminarSubmissionPageContainer />}
            />
            <Route
              path="seminars/:id"
              element={<SeminarUpdateSubmissionPageContainer />}
            />
            <Route
              path="institutions"
              element={
                <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
                  <InstitutionSubmissionPageContainer />
                </RequireAuth>
              }
            />
            <Route
              path="experiments"
              element={
                <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
                  <ExperimentSubmissionPageContainer />
                </RequireAuth>
              }
            />
            <Route
              path="journals"
              element={
                <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
                  <JournalSubmissionPageContainer />
                </RequireAuth>
              }
            />
            <Route
              path="authors/new/success"
              element={<Navigate to={SUBMISSION_SUCCESS} replace />}
            />
            <Route
              path="authors/:id/success"
              element={<AuthorUpdateSubmissionSuccessPage />}
            />
            <Route
              path="literature/new/success"
              element={<Navigate to={SUBMISSION_SUCCESS} replace />}
            />
            <Route
              path="jobs/new/success"
              element={<Navigate to={SUBMISSION_SUCCESS} replace />}
            />
            <Route
              path="jobs/:id/success"
              element={<JobUpdateSubmissionSuccessPage />}
            />
            <Route
              path="conferences/new/success"
              element={<ConferenceSubmissionSuccessPageContainer />}
            />
            <Route
              path="seminars/:id/success"
              element={<SeminarSubmissionSuccessPageContainer />}
            />
            <Route
              path="seminars/new/success"
              element={<SeminarSubmissionSuccessPageContainer />}
            />
            <Route path="success" element={<SubmissionSuccessPage />} />
          </RoutesWithFallback>
        </div>
      </>
    );
  }
}

export default Submissions;

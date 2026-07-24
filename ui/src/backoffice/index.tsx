import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { RootState } from '../types';

import RoutesWithFallback from '../common/components/RoutesWithFallback';
import DocumentHead from '../common/components/DocumentHead';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';
import AuthorsSearchPageContainer from './authors/search/containers/SearchPageContainer';
import LiteratureSearchPageContainer from './literature/search/containers/SearchPageContainer';
import DashboardPageContainer from './dashboard/containers/DashboardPageContainer';
import LoginPage from './login/components/LoginPage';
import LocalLoginPageContainer from './login/containers/LocalLoginPageContainer';
import AuthorDetailPageContainer from './authors/containers/AuthorDetailPageContainer';
import LiteratureDetailPageContainer from './literature/containers/LiteratureDetailPageContainer';
import RequireAuth from '../common/RequireAuth';

const META_DESCRIPTION = 'Tool for curators to manage submissions and harvests';
const TITLE = 'Backoffice';

const Backoffice = ({ loggedIn }: { loggedIn: boolean }) => (
  <>
    <DocumentHead title={TITLE} description={META_DESCRIPTION} />
    <div className="w-100" data-testid="backoffice">
      <RoutesWithFallback>
        <Route
          path="login"
          element={
            <RequireAuth
              authorizedRoles={SUPERUSER_OR_CATALOGER}
              loggedIn={loggedIn}
            >
              <LoginPage />
            </RequireAuth>
          }
        />
        <Route
          path="login/local"
          element={
            <RequireAuth
              authorizedRoles={SUPERUSER_OR_CATALOGER}
              loggedIn={loggedIn}
              backoffice
            >
              <LocalLoginPageContainer />
            </RequireAuth>
          }
        />
        <Route
          index
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER} backoffice>
              <DashboardPageContainer />
            </RequireAuth>
          }
        />
        <Route
          path="authors/search"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER} backoffice>
              <AuthorsSearchPageContainer />
            </RequireAuth>
          }
        />
        <Route
          path="literature/search"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER} backoffice>
              <LiteratureSearchPageContainer />
            </RequireAuth>
          }
        />
        <Route
          path="authors/:id"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER} backoffice>
              <AuthorDetailPageContainer />
            </RequireAuth>
          }
        />
        <Route
          path="literature/:id"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER} backoffice>
              <LiteratureDetailPageContainer />
            </RequireAuth>
          }
        />
      </RoutesWithFallback>
    </div>
  </>
);

const stateToProps = (state: RootState) => ({
  loggedIn: state.user.get('loggedIn'),
});

export default connect(stateToProps)(Backoffice);

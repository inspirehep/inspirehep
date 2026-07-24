import { connect } from 'react-redux';
import { Navigate, Route } from 'react-router-dom';
import { RootState } from '../types';

import ConditionalElement from '../common/components/ConditionalElement';
import LoginPageContainer from './containers/LoginPageContainer';
import ProfilePage from './components/ProfilePage';
import SignUpPageContainer from './containers/SignUpPageContainer';
import RequireAuth from '../common/RequireAuth';
import LocalLoginPageContainer from './containers/LocalLoginPageContainer';
import { USER_PROFILE, HOME } from '../common/routes';
import RoutesWithFallback from '../common/components/RoutesWithFallback';
import SettingsContainer from '../settings/containers/SettingsContainer';

const User = ({
  loggedIn,
  previousUrl = '',
}: {
  loggedIn: boolean;
  previousUrl?: string;
}) => (
  <div className="w-100" data-testid="user">
    <RoutesWithFallback>
      <Route index element={<Navigate to={USER_PROFILE} replace />} />
      <Route
        path="login"
        element={
          <ConditionalElement condition={!loggedIn} redirectTo={previousUrl}>
            <LoginPageContainer />
          </ConditionalElement>
        }
      />
      <Route
        path="settings"
        element={
          <ConditionalElement condition={loggedIn} redirectTo={previousUrl}>
            <SettingsContainer />
          </ConditionalElement>
        }
      />
      <Route
        path="signup"
        element={
          <ConditionalElement condition={!loggedIn} redirectTo={HOME}>
            <SignUpPageContainer />
          </ConditionalElement>
        }
      />
      <Route
        path="login/local"
        element={
          <ConditionalElement condition={!loggedIn} redirectTo={previousUrl}>
            <LocalLoginPageContainer />
          </ConditionalElement>
        }
      />
      <Route
        path="profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
    </RoutesWithFallback>
  </div>
);

const stateToProps = (state: RootState) => ({
  loggedIn: state.user.get('loggedIn'),
  previousUrl: state.router.location.previousUrl,
});

export default connect(stateToProps)(User);

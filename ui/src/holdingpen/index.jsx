import { Component } from 'react';
import { Route, Navigate } from 'react-router-dom';

import DashboardPageContainer from './containers/DashboardPageContainer';
import InspectPageContainer from './containers/InspectPageContainer';
import { HOLDINGPEN_DASHBOARD } from '../common/routes';
import RoutesWithFallback from '../common/components/RoutesWithFallback';

class Holdingpen extends Component {
  render() {
    return (
      <div className="w-100" data-testid="holdingpen">
        <RoutesWithFallback>
          <Route
            index
            element={<Navigate to={HOLDINGPEN_DASHBOARD} replace />}
          />
          <Route path="dashboard" element={<DashboardPageContainer />} />
          <Route path="inspect/:id" element={<InspectPageContainer />} />
        </RoutesWithFallback>
      </div>
    );
  }
}

export default Holdingpen;

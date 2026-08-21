import { Route } from 'react-router-dom';

import './index.less';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';
import ReferenceDiffInterfaceContainer from './containers/ReferenceDiffInterfaceContainer';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';
import RoutesWithFallback from '../common/components/RoutesWithFallback';
import RequireAuth from '../common/RequireAuth';

function Literature() {
  return (
    <div className="__Literature__" data-testid="literature">
      <RoutesWithFallback>
        <Route index element={<SearchPageContainer />} />
        <Route path=":id" element={<DetailPageContainer />} />
        <Route
          path=":id/diff/:diff"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
              <ReferenceDiffInterfaceContainer />
            </RequireAuth>
          }
        />
      </RoutesWithFallback>
    </div>
  );
}

export default Literature;

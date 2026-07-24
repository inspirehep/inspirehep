import { Route } from 'react-router-dom';

import './index.less';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

import RoutesWithFallback from '../common/components/RoutesWithFallback';

function Data() {
  return (
    <div className="__Data__ w-100" data-testid="data">
      <RoutesWithFallback>
        <Route index element={<SearchPageContainer />} />
        <Route path=":id" element={<DetailPageContainer />} />
      </RoutesWithFallback>
    </div>
  );
}

export default Data;

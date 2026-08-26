import { Route } from 'react-router-dom';

import './index.less';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';
import RoutesWithFallback from '../common/components/RoutesWithFallback';

function Literature() {
  return (
    <div className="__Literature__" data-testid="literature">
      <RoutesWithFallback>
        <Route index element={<SearchPageContainer />} />
        <Route path=":id" element={<DetailPageContainer />} />
      </RoutesWithFallback>
    </div>
  );
}

export default Literature;

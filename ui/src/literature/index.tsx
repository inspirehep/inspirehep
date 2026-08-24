import { Route } from 'react-router-dom';

import './index.less';
import { LITERATURE } from '../common/routes';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';
import SafeSwitch from '../common/components/SafeSwitch';

function Literature() {
  return (
    <div className="__Literature__" data-testid="literature">
      <SafeSwitch>
        <Route exact path={LITERATURE} component={SearchPageContainer} />
        <Route
          exact
          path={`${LITERATURE}/:id`}
          component={DetailPageContainer}
        />
      </SafeSwitch>
    </div>
  );
}

export default Literature;

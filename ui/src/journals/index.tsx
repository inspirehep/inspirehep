import React from 'react';
import { Route } from 'react-router-dom';

import { JOURNALS } from '../common/routes';

import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

function Journals() {
  return (
    <div className="w-100">
      {/* @ts-ignore */}
      <Route exact path={JOURNALS} component={SearchPageContainer} />
      <Route exact path={`${JOURNALS}/:id`} component={DetailPageContainer} />
    </div>
  )
}

export default Journals;

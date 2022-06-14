import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getWrapperComponentDisplayName } from './utils';
import LoadingOrChildren from './components/LoadingOrChildren';

// used to dispatch actions when route has changed
export default function withRouteActionsDispatcher(
  DetailPage,
  { routeParamSelector, routeActions, loadingStateSelector }
) {
  const Wrapper = ({ match, dispatch, loading, ...props }) => {
    const selectedParam = routeParamSelector(match.params);
    useEffect(
      () => {
        routeActions(selectedParam).forEach(dispatch);
      },
      [selectedParam, dispatch]
    );

    return (
      <LoadingOrChildren loading={loading}>
        <DetailPage {...props} />
      </LoadingOrChildren>
    );
  };

  const ConnectedWrapper = connect(
    state => ({ loading: loadingStateSelector(state) }),
    dispatch => ({ dispatch })
  )(Wrapper);

  const ConnectedWrapperWithRouter = withRouter(ConnectedWrapper);

  ConnectedWrapperWithRouter.displayName = getWrapperComponentDisplayName(
    'withRouteActionsDispatcher',
    DetailPage
  );
  return ConnectedWrapperWithRouter;
}

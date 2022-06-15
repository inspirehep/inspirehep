import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getWrapperComponentDisplayName } from './utils';
import LoadingOrChildren from './components/LoadingOrChildren';

// used to dispatch actions when route has changed
export default function withRouteActionsDispatcher(
  DetailPage: any,
  {
    routeParamSelector,
    routeActions,
    loadingStateSelector
  }: any
) {
  const Wrapper = ({
    match,
    dispatch,
    loading,
    ...props
  }: any) => {
    const selectedParam = routeParamSelector(match.params);
    useEffect(
      () => {
        routeActions(selectedParam).forEach(dispatch);
      },
      [selectedParam, dispatch]
    );

    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LoadingOrChildren loading={loading}>
        <DetailPage {...props} />
      </LoadingOrChildren>
    );
  };

  const ConnectedWrapper = connect(
    (state: any) => ({
      loading: loadingStateSelector(state)
    }),
    (dispatch: any) => ({
      dispatch
    })
  )(Wrapper);

  const ConnectedWrapperWithRouter = withRouter(ConnectedWrapper);

  ConnectedWrapperWithRouter.displayName = getWrapperComponentDisplayName(
    'withRouteActionsDispatcher',
    DetailPage
  );
  return ConnectedWrapperWithRouter;
}

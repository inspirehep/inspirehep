import React, { useEffect } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

import React, { useEffect } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { withRouter } from 'react-router-dom';

import { getWrapperComponentDisplayName } from './utils';
import LoadingOrChildren from './components/LoadingOrChildren';

// used to dispatch actions when route has changed
export default function withRouteActionsDispatcher(
  DetailPage: $TSFixMe,
  {
    routeParamSelector,
    routeActions,
    loadingStateSelector
  }: $TSFixMe
) {
  const Wrapper = ({
    match,
    dispatch,
    loading,
    ...props
  }: $TSFixMe) => {
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
    (state: $TSFixMe) => ({
      loading: loadingStateSelector(state)
    }),
    (dispatch: $TSFixMe) => ({
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

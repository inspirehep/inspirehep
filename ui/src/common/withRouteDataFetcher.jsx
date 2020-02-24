import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getWrapperComponentDisplayName } from './utils';
import LoadingOrChildren from './components/LoadingOrChildren';

export default function withRouteDataFetcher(
  DetailPage,
  { routeParamsToFetchActions, stateToLoading }
) {
  const Wrapper = ({ match, dispatch, state, ...props }) => {
    useEffect(
      () => {
        routeParamsToFetchActions(match.params).forEach(dispatch);
      },
      [match.params, dispatch]
    );

    const loading = stateToLoading(state);
    return (
      <LoadingOrChildren loading={loading}>
        <DetailPage {...props} />
      </LoadingOrChildren>
    );
  };

  const ConnectedWrapper = connect(
    state => ({ state }),
    dispatch => ({ dispatch })
  )(Wrapper);

  const ConnectedWrapperWithRouter = withRouter(ConnectedWrapper);

  ConnectedWrapperWithRouter.displayName = getWrapperComponentDisplayName(
    'withRouteDataFetcher',
    DetailPage
  );
  return ConnectedWrapperWithRouter;
}

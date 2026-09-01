import { useEffect } from 'react';
import { Action, ActionCreator, Dispatch } from 'redux';
import { legacy_connect as connect, ConnectedComponent } from 'react-redux';
import { Params, useParams } from 'react-router-dom';
import { RootState } from '../types';

import LoadingOrChildren from './components/LoadingOrChildren';
import { HttpClientWrapper } from './http';
import { getWrapperComponentDisplayName } from './utils';

// used to dispatch actions when route has changed
export default function withRouteActionsDispatcher<T>(
  DetailPage: ConnectedComponent<any, any>,
  {
    routeParamSelector,
    routeActions,
    loadingStateSelector,
  }: {
    routeParamSelector: (args: Params<string>) => T;
    routeActions: (
      selectedParam: T
    ) => (
      | ((
          dispatch: Dispatch<Action>,
          getState: () => RootState,
          http: HttpClientWrapper
        ) => Promise<void>)
      | { type: string; payload: unknown }
    )[];
    loadingStateSelector: (state: RootState) => boolean;
  }
) {
  const Wrapper = ({
    dispatch,
    loading,
    loggedIn,
    ...props
  }: {
    dispatch: ActionCreator<Action>;
    loading: boolean;
    loggedIn: boolean;
  }) => {
    const params = useParams();
    const selectedParam = routeParamSelector(params);

    useEffect(() => {
      routeActions(selectedParam).forEach(dispatch);
    }, [selectedParam, dispatch, loggedIn]);

    return (
      <LoadingOrChildren loading={loading}>
        <DetailPage {...props} />
      </LoadingOrChildren>
    );
  };

  const ConnectedWrapper = connect(
    (state: RootState) => ({
      loading: loadingStateSelector(state),
      loggedIn: state.user.get('loggedIn'),
    }),
    (dispatch) => ({ dispatch })
  )(Wrapper);

  ConnectedWrapper.displayName = getWrapperComponentDisplayName(
    'withRouteActionsDispatcher',
    DetailPage
  );
  return ConnectedWrapper;
}

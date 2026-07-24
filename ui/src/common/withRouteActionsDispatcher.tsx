import { useEffect, useMemo } from 'react';
import { Action, ActionCreator, AnyAction, Dispatch } from 'redux';
import { connect, ConnectedComponent } from 'react-redux';
import { Params, useParams } from 'react-router-dom';
import { RootState } from '../types';

import LoadingOrChildren from './components/LoadingOrChildren';
import { HttpClientWrapper } from './http';

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
          dispatch: Dispatch<AnyAction>,
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
    ...props
  }: {
    dispatch: ActionCreator<Action>;
    loading: boolean;
  }) => {
    const params = useParams();
    // Keep `selectedParam` referentially stable so the effect below only re-runs
    // when the resolved param values change, not on every render. This matters
    // for selectors that return a fresh object (e.g. the reference diff page),
    // which would otherwise re-dispatch the route actions on each render.
    const paramsKey = JSON.stringify(params);
    const selectedParam = useMemo(
      () => routeParamSelector(params as { id: string }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [paramsKey]
    );
    useEffect(() => {
      routeActions(selectedParam).forEach(dispatch);
    }, [selectedParam, dispatch]);

    return (
      <LoadingOrChildren loading={loading}>
        <DetailPage {...props} />
      </LoadingOrChildren>
    );
  };

  return connect(
    (state: RootState) => ({ loading: loadingStateSelector(state) }),
    (dispatch) => ({ dispatch })
  )(Wrapper);
}

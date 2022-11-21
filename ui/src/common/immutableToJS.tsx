import React from 'react';
import { isImmutable } from 'immutable';

import { getWrapperComponentDisplayName } from './utils';

export function convertAllImmutablePropsToJS(WrappedComponent: React.FC<any>) {
  const Wrapper = (wrappedComponentProps: Record<string, any>) => {
    const propsAsJS = Object.keys(wrappedComponentProps).reduce(
      (newProps: Record<string, any>, key: string) => {
        const value = wrappedComponentProps[key];
        newProps[key] = isImmutable(value) ? value.toJS() : value;
        return newProps;
      },
      {}
    );

    return <WrappedComponent {...propsAsJS} />;
  };
  Wrapper.displayName = getWrapperComponentDisplayName(
    'toAllJS',
    WrappedComponent
  );
  return Wrapper;
};

export const convertSomeImmutablePropsToJS = (
  WrappedComponent: React.FC,
  propsToConvert: Record<string, any>
) => {
  const Wrapper = (wrappedComponentProps: Record<string, any>) => {
    const convertedProps = propsToConvert
      .filter((prop: string) => wrappedComponentProps[prop])
      .reduce((propsAsJS: any, prop: string) => {
        let props = wrappedComponentProps[prop];
        if (isImmutable(props)) {
          props = props.toJS();
        }
        propsAsJS[prop] = props;
        return propsAsJS;
      }, {});

    return <WrappedComponent {...wrappedComponentProps} {...convertedProps} />;
  };

  Wrapper.displayName = getWrapperComponentDisplayName(
    'toSomeJS',
    WrappedComponent
  );
  return Wrapper;
};

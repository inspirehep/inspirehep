import React from 'react';
import { Iterable, isImmutable } from 'immutable';
import { getWrapperComponentDisplayName } from './utils';

export const convertAllImmutablePropsToJS = (WrappedComponent) => {
  const Wrapper = (wrappedComponentProps) => {
    const propsAsJS = Object.keys(wrappedComponentProps).reduce(
      (newProps, key) => {
        const value = wrappedComponentProps[key];
        newProps[key] = Iterable.isIterable(value) ? value.toJS() : value;
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
  WrappedComponent,
  propsToConvert
) => {
  const Wrapper = (wrappedComponentProps) => {
    const convertedProps = propsToConvert
      .filter((prop) => wrappedComponentProps[prop])
      .reduce((propsAsJS, prop) => {
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

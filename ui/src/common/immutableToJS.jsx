import React from 'react';
import { Iterable } from 'immutable';

// TODO: make these class HOC, and set displayName such as toAllJS(WrapperComponentName)
// in order to improve debugging and snapshot testing

export const convertAllImmutablePropsToJS = WrappedComponent => wrappedComponentProps => {
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

export const convertSomeImmutablePropsToJS = (
  WrappedComponent,
  propsToConvert
) => wrappedComponentProps => {
  const convertedProps = propsToConvert
    .filter(prop => wrappedComponentProps[prop])
    .reduce((propsAsJS, prop) => {
      propsAsJS[prop] = wrappedComponentProps[prop].toJS();
      return propsAsJS;
    }, {});

  return <WrappedComponent {...wrappedComponentProps} {...convertedProps} />;
};

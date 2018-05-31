import React from 'react';
import { Iterable } from 'immutable';

export default WrappedComponent => wrappedComponentProps => {
  const propsAsJS = Object.entries(wrappedComponentProps).reduce(
    (newProps, [key, value]) => {
      // eslint-disable-next-line no-param-reassign
      newProps[key] = Iterable.isIterable(value) ? value.toJS() : value;
      return newProps;
    },
    {}
  );

  return <WrappedComponent {...propsAsJS} />;
};

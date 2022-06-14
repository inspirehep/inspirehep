import React from 'react';
// @ts-expect-error ts-migrate(2305) FIXME: Module '"immutable"' has no exported member 'Itera... Remove this comment to see the full error message
import { Iterable, isImmutable } from 'immutable';
import { getWrapperComponentDisplayName } from './utils';

export const convertAllImmutablePropsToJS = (WrappedComponent: $TSFixMe) => {
  const Wrapper = (wrappedComponentProps: $TSFixMe) => {
    const propsAsJS = Object.keys(wrappedComponentProps).reduce(
      (newProps, key) => {
        const value = wrappedComponentProps[key];
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
  WrappedComponent: $TSFixMe,
  propsToConvert: $TSFixMe
) => {
  const Wrapper = (wrappedComponentProps: $TSFixMe) => {
    const convertedProps = propsToConvert
      .filter((prop: $TSFixMe) => wrappedComponentProps[prop])
      .reduce((propsAsJS: $TSFixMe, prop: $TSFixMe) => {
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

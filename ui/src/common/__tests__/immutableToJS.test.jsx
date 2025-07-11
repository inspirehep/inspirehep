import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import {
  convertAllImmutablePropsToJS,
  convertSomeImmutablePropsToJS,
} from '../immutableToJS';

function MutableDummy(props) {
  return <span {...props} />;
}

describe('immutableToJS', () => {
  describe('convertAllImmutablePropsToJS', () => {
    it('converts all immutable props to built in js', () => {
      const ImmutableDummy = convertAllImmutablePropsToJS(MutableDummy);
      const immutableProp = fromJS({
        list: [{ foo: 'bar1' }, { foo: 'bar2' }],
      });
      const primitiveProp = 'string';
      const mutableProp = {
        array: [{ foo: 'bar' }],
      };
      const { asFragment } = render(
        <ImmutableDummy
          immutableProp={immutableProp}
          mutableProp={mutableProp}
          primitiveProp={primitiveProp}
        />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('convertSomeImmutablePropsToJS', () => {
    it('converts some immutable props to built in js', () => {
      const ImmutableDummy = convertSomeImmutablePropsToJS(MutableDummy, [
        'immutableProp1',
      ]);

      const immutableProp1 = fromJS({
        list: [{ foo: 'bar1' }, { foo: 'bar2' }],
      });
      const immutableProp2 = fromJS({
        foo: 'bar',
      });
      const primitiveProp = 'string';
      const mutableProp = {
        array: [{ foo: 'bar' }],
      };
      const { asFragment } = render(
        <ImmutableDummy
          immutableProp1={immutableProp1}
          immutableProp2={immutableProp2}
          mutableProp={mutableProp}
          primitiveProp={primitiveProp}
        />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});

import { render } from '@testing-library/react';
import { fromJS, isImmutable } from 'immutable';

import {
  convertAllImmutablePropsToJS,
  convertSomeImmutablePropsToJS,
} from '../immutableToJS';

describe('immutableToJS', () => {
  describe('convertAllImmutablePropsToJS', () => {
    it('converts all immutable props to built in js', () => {
      let receivedProps;
      const MutableDummy = (props) => {
        receivedProps = props;
        return null;
      };

      const ImmutableDummy = convertAllImmutablePropsToJS(MutableDummy);
      const immutableProp = fromJS({
        list: [{ foo: 'bar1' }, { foo: 'bar2' }],
      });
      const primitiveProp = 'string';
      const mutableProp = {
        array: [{ foo: 'bar' }],
      };
      render(
        <ImmutableDummy
          immutableProp={immutableProp}
          mutableProp={mutableProp}
          primitiveProp={primitiveProp}
        />
      );

      expect(isImmutable(receivedProps.immutableProp)).toBe(false);
      expect(receivedProps.immutableProp).toEqual({
        list: [{ foo: 'bar1' }, { foo: 'bar2' }],
      });
      expect(receivedProps.mutableProp).toBe(mutableProp);
      expect(receivedProps.primitiveProp).toBe(primitiveProp);
    });
  });

  describe('convertSomeImmutablePropsToJS', () => {
    it('converts some immutable props to built in js', () => {
      let receivedProps;
      const MutableDummy = (props) => {
        receivedProps = props;
        return null;
      };

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
      render(
        <ImmutableDummy
          immutableProp1={immutableProp1}
          immutableProp2={immutableProp2}
          mutableProp={mutableProp}
          primitiveProp={primitiveProp}
        />
      );

      expect(isImmutable(receivedProps.immutableProp1)).toBe(false);
      expect(receivedProps.immutableProp1).toEqual({
        list: [{ foo: 'bar1' }, { foo: 'bar2' }],
      });
      expect(isImmutable(receivedProps.immutableProp2)).toBe(true);
      expect(receivedProps.immutableProp2).toBe(immutableProp2);
      expect(receivedProps.mutableProp).toBe(mutableProp);
      expect(receivedProps.primitiveProp).toBe(primitiveProp);
    });
  });
});

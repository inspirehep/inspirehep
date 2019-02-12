import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import immutableToJS from '../immutableToJS';

function MutableDummy(props) {
  return <span {...props} />;
}

const ImmutableDummy = immutableToJS(MutableDummy);

describe('immutableToJS', () => {
  it('converts immutable props to built in js', () => {
    const immutableProp = fromJS({
      list: [{ foo: 'bar1' }, { foo: 'bar2' }],
    });
    const primitiveProp = 'string';
    const mutableProp = {
      array: [{ foo: 'bar' }],
    };
    const wrapper = shallow(
      <ImmutableDummy
        immutableProp={immutableProp}
        mutableProp={mutableProp}
        primitiveProp={primitiveProp}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

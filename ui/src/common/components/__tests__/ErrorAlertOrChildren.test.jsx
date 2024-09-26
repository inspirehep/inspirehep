import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ErrorAlertOrChildren from '../ErrorAlertOrChildren';

describe('ErrorAlertOrChildren', () => {
  it('renders error if present', () => {
    const wrapper = shallow(
      <ErrorAlertOrChildren error={fromJS({ message: 'Error' })}>
        Nope
      </ErrorAlertOrChildren>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders children without eror', () => {
    const wrapper = shallow(
      <ErrorAlertOrChildren error={null}>
        <div>Test</div>
      </ErrorAlertOrChildren>
    );
    expect(wrapper).toMatchSnapshot();
  });
});

import React from 'react';
import { shallow } from 'enzyme';

import ModalSuccessResult from '../ModalSuccessResult';

describe('ModalSuccessResult', () => {
  it('renders with children', () => {
    const wrapper = shallow(
      <ModalSuccessResult>
        <span>Successfully did the thing</span>
      </ModalSuccessResult>
    );
    expect(wrapper).toMatchSnapshot();
  });
});

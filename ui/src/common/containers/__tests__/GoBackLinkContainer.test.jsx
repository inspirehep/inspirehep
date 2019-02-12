import React from 'react';
import { shallow } from 'enzyme';
import { goBack } from 'react-router-redux';

import { getStore } from '../../../fixtures/store';
import GoBackLinkContainer, { dispatchToProps } from '../GoBackLinkContainer';

describe('GoBackLinkContainer', () => {
  it('render without props', () => {
    const wrapper = shallow(<GoBackLinkContainer store={getStore()} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('render with custom children', () => {
    const wrapper = shallow(
      <GoBackLinkContainer store={getStore()}>custom</GoBackLinkContainer>
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls dispatch with goBack() on click', () => {
    const mockDispatch = jest.fn();
    const { onClick } = dispatchToProps(mockDispatch);
    onClick();
    expect(mockDispatch).toHaveBeenCalledWith(goBack());
  });
});

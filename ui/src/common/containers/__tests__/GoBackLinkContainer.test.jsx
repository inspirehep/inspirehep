import React from 'react';
import { mount } from 'enzyme';
import { goBack } from 'connected-react-router';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import GoBackLinkContainer, { dispatchToProps } from '../GoBackLinkContainer';
import GoBackLink from '../../components/GoBackLink';

describe('GoBackLinkContainer', () => {
  it('render with custom children', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <GoBackLinkContainer>custom</GoBackLinkContainer>
      </Provider>
    );

    expect(wrapper.find(GoBackLink)).toHaveProp({
      children: 'custom',
    });
  });

  it('calls dispatch with goBack() on click', () => {
    const mockDispatch = jest.fn();
    const { onClick } = dispatchToProps(mockDispatch);
    onClick();
    expect(mockDispatch).toHaveBeenCalledWith(goBack());
  });
});

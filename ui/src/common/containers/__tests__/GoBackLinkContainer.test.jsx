import React from 'react';
import { mount } from 'enzyme';
import { goBack } from 'connected-react-router';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import GoBackLinkContainer from '../GoBackLinkContainer';
import GoBackLink from '../../components/GoBackLink';

jest.mock('connected-react-router');

goBack.mockReturnValue(async () => {});

describe('GoBackLinkContainer', () => {
  afterEach(() => {
    goBack.mockClear();
  });

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

  it('calls goBack() on click', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <GoBackLinkContainer />
      </Provider>
    );
    const onClick = wrapper.find(GoBackLink).prop('onClick');
    onClick();
    expect(goBack).toHaveBeenCalled();
  });
});

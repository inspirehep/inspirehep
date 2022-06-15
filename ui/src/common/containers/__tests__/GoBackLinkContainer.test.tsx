import React from 'react';
import { mount } from 'enzyme';
import { goBack } from 'connected-react-router';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import GoBackLinkContainer from '../GoBackLinkContainer';
import GoBackLink from '../../components/GoBackLink';


jest.mock('connected-react-router');

// @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValue' does not exist on type ... Remove this comment to see the full error message
goBack.mockReturnValue(async () => {});


describe('GoBackLinkContainer', () => {
 
  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '() =>... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    onClick();
    
    expect(goBack).toHaveBeenCalled();
  });
});

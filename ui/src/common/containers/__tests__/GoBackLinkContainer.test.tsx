import React from 'react';
import { mount } from 'enzyme';
import { goBack } from 'connected-react-router';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import GoBackLinkContainer from '../GoBackLinkContainer';
import GoBackLink from '../../components/GoBackLink';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('connected-react-router');

(goBack as $TSFixMe).mockReturnValue(async () => { });

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoBackLinkContainer', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    (goBack as $TSFixMe).mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('render with custom children', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <GoBackLinkContainer>custom</GoBackLinkContainer>
      </Provider>
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(GoBackLink)).toHaveProp({
      children: 'custom',
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls goBack() on click', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <GoBackLinkContainer />
      </Provider>
    );
    const onClick = wrapper.find(GoBackLink).prop('onClick');
    onClick();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(goBack).toHaveBeenCalled();
  });
});

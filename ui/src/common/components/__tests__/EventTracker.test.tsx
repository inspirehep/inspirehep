import React from 'react';
import { shallow } from 'enzyme';

import { trackEvent } from '../../../tracker';
import EventTracker from '../EventTracker';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../tracker');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('EventTracker', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '(...a... Remove this comment to see the full error message
    trackEvent.mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls trackEvent and onClick of the child', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChildClick = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventId: string; }' is ... Remove this comment to see the full error message
      <EventTracker eventId="DudeButton">
        <button type="button" onClick={onChildClick}>
          Dude
        </button>
      </EventTracker>
    );
    wrapper.find('button').simulate('click', 'clickArg1', 'clickArg2');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChildClick).toHaveBeenCalledWith('clickArg1', 'clickArg2');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(trackEvent).toHaveBeenCalledWith('User', 'onClick', 'DudeButton');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls trackEvent and custom event prop of the child with eventPropName', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChildBlur = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventPropName: string; ... Remove this comment to see the full error message
      <EventTracker eventPropName="onBlur" eventId="DudeButton">
        <button type="button" onBlur={onChildBlur}>
          Dude
        </button>
      </EventTracker>
    );
    wrapper.find('button').simulate('blur');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChildBlur).toHaveBeenCalledTimes(1);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(trackEvent).toHaveBeenCalledWith('User', 'onBlur', 'DudeButton');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls trackEvent only if child does not have this event', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventPropName: string; ... Remove this comment to see the full error message
      <EventTracker eventPropName="onClick" eventId="DudeDiv">
        <div>Dude</div>
      </EventTracker>
    );
    wrapper.find('div').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(trackEvent).toHaveBeenCalledWith('User', 'onClick', 'DudeDiv');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls trackEvent with event args if forwardEventArgs is set', () => {
    const wrapper = shallow(
      <EventTracker
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventId: string; eventP... Remove this comment to see the full error message
        eventId="DudeButton"
        eventPropName="onClick"
        extractEventArgsToForward={(eventArgs: any) => eventArgs.filter((arg: any) => typeof arg === 'string')
        }
      >
        <button type="button">Dude</button>
      </EventTracker>
    );
    wrapper.find('button').simulate('click', 'Arg1', 999, 'Arg2');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(trackEvent).toHaveBeenCalledWith('User', 'onClick', [
      'DudeButton',
      ['Arg1', 'Arg2'],
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders only children', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventPropName: string; ... Remove this comment to see the full error message
      <EventTracker eventPropName="onBlur" eventId="DudeInput">
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        <input onBlur={jest.fn()} />
      </EventTracker>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});

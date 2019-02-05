import React from 'react';
import { shallow } from 'enzyme';

import * as tracker from '../../../tracker';
import EventTracker from '../EventTracker';

jest.mock('../../../tracker');

describe('EventTracker', () => {
  it('calls trackEvent and onClick of the child', () => {
    const onChildClick = jest.fn();
    tracker.trackEvent = jest.fn();
    const wrapper = shallow(
      <EventTracker eventId="DudeButton">
        <button type="button" onClick={onChildClick}>
          Dude
        </button>
      </EventTracker>
    );
    wrapper.find('button').simulate('click', 'clickArg1', 'clickArg2');
    expect(onChildClick).toHaveBeenCalledWith('clickArg1', 'clickArg2');
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      'User',
      'onClick',
      'DudeButton'
    );
  });

  it('calls trackEvent and custom event prop of the child with eventPropName', () => {
    const onChildBlur = jest.fn();
    tracker.trackEvent = jest.fn();
    const wrapper = shallow(
      <EventTracker eventPropName="onBlur" eventId="DudeButton">
        <button type="button" onBlur={onChildBlur}>
          Dude
        </button>
      </EventTracker>
    );
    wrapper.find('button').simulate('blur');
    expect(onChildBlur).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      'User',
      'onBlur',
      'DudeButton'
    );
  });

  it('calls trackEvent only if child does not have this event', () => {
    tracker.trackEvent = jest.fn();
    const wrapper = shallow(
      <EventTracker eventPropName="onClick" eventId="DudeDiv">
        <div>Dude</div>
      </EventTracker>
    );
    wrapper.find('div').simulate('click');
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      'User',
      'onClick',
      'DudeDiv'
    );
  });

  it('renders only children', () => {
    const wrapper = shallow(
      <EventTracker eventPropName="onBlur" eventId="DudeInput">
        <input onBlur={jest.fn()} />
      </EventTracker>
    );
    expect(wrapper).toMatchSnapshot();
  });
});

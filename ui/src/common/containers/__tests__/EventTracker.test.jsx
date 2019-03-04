import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import * as tracker from '../../../tracker';
import { getStore, getStoreWithState } from '../../../fixtures/store';
import EventTracker from '../EventTracker';

jest.mock('../../../tracker');

describe('EventTracker', () => {
  it('calls trackEvent and onClick of the child', () => {
    const onChildClick = jest.fn();
    tracker.trackEvent = jest.fn();
    const wrapper = shallow(
      <EventTracker eventId="DudeButton" store={getStore()}>
        <button type="button" onClick={onChildClick}>
          Dude
        </button>
      </EventTracker>
    ).dive();
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
      <EventTracker
        eventPropName="onBlur"
        eventId="DudeButton"
        store={getStore()}
      >
        <button type="button" onBlur={onChildBlur}>
          Dude
        </button>
      </EventTracker>
    ).dive();
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
      <EventTracker
        eventPropName="onClick"
        eventId="DudeDiv"
        store={getStore()}
      >
        <div>Dude</div>
      </EventTracker>
    ).dive();
    wrapper.find('div').simulate('click');
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      'User',
      'onClick',
      'DudeDiv'
    );
  });

  it('calls trackEvent with event args if forwardEventArgs is set', () => {
    tracker.trackEvent = jest.fn();
    const wrapper = shallow(
      <EventTracker
        store={getStore()}
        eventId="DudeButton"
        eventPropName="onClick"
        extractEventArgsToForward={eventArgs =>
          eventArgs.filter(arg => typeof arg === 'string')
        }
      >
        <button type="button">Dude</button>
      </EventTracker>
    ).dive();
    wrapper.find('button').simulate('click', 'Arg1', 999, 'Arg2');
    expect(tracker.trackEvent).toHaveBeenCalledWith('User', 'onClick', [
      'DudeButton',
      ['Arg1', 'Arg2'],
    ]);
  });

  it('calls trackEvent and onClick of the child for Superuser', () => {
    const onChildClick = jest.fn();
    tracker.trackEvent = jest.fn();
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['superuser', 'cataloger', 'another'],
        },
      }),
    });
    const wrapper = shallow(
      <EventTracker eventId="DudeButton" store={store}>
        <button type="button" onClick={onChildClick}>
          Dude
        </button>
      </EventTracker>
    ).dive();
    wrapper.find('button').simulate('click', 'clickArg1', 'clickArg2');
    expect(onChildClick).toHaveBeenCalledWith('clickArg1', 'clickArg2');
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      'Superuser',
      'onClick',
      'DudeButton'
    );
  });

  it('calls trackEvent and onClick of the child for cataloger', () => {
    const onChildClick = jest.fn();
    tracker.trackEvent = jest.fn();
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['cataloger', 'another'],
        },
      }),
    });
    const wrapper = shallow(
      <EventTracker eventId="DudeButton" store={store}>
        <button type="button" onClick={onChildClick}>
          Dude
        </button>
      </EventTracker>
    ).dive();
    wrapper.find('button').simulate('click', 'clickArg1', 'clickArg2');
    expect(onChildClick).toHaveBeenCalledWith('clickArg1', 'clickArg2');
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      'Cataloger',
      'onClick',
      'DudeButton'
    );
  });

  it('renders only children', () => {
    const wrapper = shallow(
      <EventTracker
        eventPropName="onBlur"
        eventId="DudeInput"
        store={getStore()}
      >
        <input onBlur={jest.fn()} />
      </EventTracker>
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
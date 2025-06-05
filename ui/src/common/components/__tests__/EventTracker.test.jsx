import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { trackEvent } from '../../../tracker';
import EventTracker from '../EventTracker';

jest.mock('../../../tracker');

describe('EventTracker', () => {
  afterEach(() => {
    trackEvent.mockClear();
  });

  it('calls trackEvent and onClick of the child', () => {
    const onChildClick = jest.fn();
    const screen = render(
      <EventTracker
        eventId="DudeButton"
        eventCategory="User"
        eventAction="btn click"
      >
        <button type="button" onClick={onChildClick} data-testid="test-button">
          Dude
        </button>
      </EventTracker>
    );

    fireEvent.click(screen.getByTestId('test-button'));

    expect(onChildClick).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith('User', 'btn click', 'DudeButton');
  });

  it('calls trackEvent and custom event prop of the child with eventPropName', () => {
    const onChildBlur = jest.fn();
    const screen = render(
      <EventTracker
        eventPropName="onBlur"
        eventId="DudeButton"
        eventCategory="User"
        eventAction="btn blur"
      >
        <button type="button" onBlur={onChildBlur} data-testid="test-button">
          Dude
        </button>
      </EventTracker>
    );

    fireEvent.blur(screen.getByTestId('test-button'));

    expect(onChildBlur).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith('User', 'btn blur', 'DudeButton');
  });

  it('calls trackEvent only if child does not have this event', () => {
    const screen = render(
      <EventTracker
        eventPropName="onClick"
        eventId="DudeDiv"
        eventCategory="User"
        eventAction="btn click"
      >
        <div data-testid="test-button">Dude</div>
      </EventTracker>
    );

    fireEvent.click(screen.getByTestId('test-button'));

    expect(trackEvent).toHaveBeenCalledWith('User', 'btn click', 'DudeDiv');
  });

  it('calls trackEvent with event args if forwardEventArgs is set', () => {
    const screen = render(
      <EventTracker
        eventId="DudeButton"
        eventPropName="onClick"
        eventCategory="User"
        eventAction="btn click"
        extractEventArgsToForward={(eventArgs) =>
          eventArgs.filter((arg) => typeof arg === 'string')
        }
      >
        <button type="button" data-testid="test-button">
          Dude
        </button>
      </EventTracker>
    );

    fireEvent.click(screen.getByTestId('test-button'));

    expect(trackEvent).toHaveBeenCalledWith('User', 'btn click', [
      'DudeButton',
      [],
    ]);
  });

  it('renders only children', () => {
    const { asFragment } = render(
      <EventTracker
        eventPropName="onBlur"
        eventId="DudeInput"
        eventCategory="User"
        eventAction="btn blur"
      >
        <input onBlur={jest.fn()} data-testid="test-button" />
      </EventTracker>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

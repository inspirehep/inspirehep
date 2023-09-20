import React from 'react';

import { trackEvent } from '../../tracker';

const EventTracker = ({
  children,
  eventPropName,
  eventId,
  eventCategory,
  eventAction,
  extractEventArgsToForward,
}: {
  children: any;
  eventPropName: string;
  eventId: string;
  eventCategory: string;
  eventAction: string;
  extractEventArgsToForward: Function;
}) => {
  function onEventWithTracking(...eventArgs: any) {
    const eventName = extractEventArgsToForward
      ? [eventId, extractEventArgsToForward(eventArgs)]
      : eventId;
    trackEvent(eventCategory, eventAction, eventName);

    if (children.props[eventPropName]) {
      children.props[eventPropName](...eventArgs);
    }
  }

  return React.cloneElement(children, {
    [eventPropName]: onEventWithTracking,
  });
};

EventTracker.defaultProps = {
  eventPropName: 'onClick',
  extractEventArgsToForward: null,
};

export default EventTracker;

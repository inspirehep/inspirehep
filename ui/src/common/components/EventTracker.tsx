import React, { Component } from 'react';

import { trackEvent } from '../../tracker';

type OwnProps = {
    eventPropName?: string;
    eventId: string;
    extractEventArgsToForward?: $TSFixMeFunction;
};

type Props = OwnProps & typeof EventTracker.defaultProps;

class EventTracker extends Component<Props> {

static defaultProps = {
    eventPropName: 'onClick',
    extractEventArgsToForward: null,
};

  constructor(props: Props) {
    super(props);

    this.onEventWithTracking = this.onEventWithTracking.bind(this);
  }

  onEventWithTracking(...eventArgs: $TSFixMe[]) {
    const {
      children,
      eventId,
      eventPropName,
      extractEventArgsToForward,
    } = this.props;

    const eventInfo = extractEventArgsToForward
      ? // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
        [eventId, extractEventArgsToForward(eventArgs)]
      : eventId;
    trackEvent('User', eventPropName, eventInfo);

    if ((children as $TSFixMe).props[eventPropName]) {
      (children as $TSFixMe).props[eventPropName](...eventArgs);
    }
  }

  render() {
    const { children, eventPropName } = this.props;
    return React.cloneElement(children, {
      [eventPropName]: this.onEventWithTracking,
    });
  }
}

export default EventTracker;

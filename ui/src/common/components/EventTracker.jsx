import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { trackEvent } from '../../tracker';

class EventTracker extends Component {
  constructor(props) {
    super(props);

    this.onEventWithTracking = this.onEventWithTracking.bind(this);
  }

  onEventWithTracking(...eventArgs) {
    const {
      children,
      eventId,
      eventPropName,
      extractEventArgsToForward,
    } = this.props;

    const eventInfo = extractEventArgsToForward
      ? [eventId, extractEventArgsToForward(eventArgs)]
      : eventId;
    trackEvent('User', eventPropName, eventInfo);

    if (children.props[eventPropName]) {
      children.props[eventPropName](...eventArgs);
    }
  }

  render() {
    const { children, eventPropName } = this.props;
    return React.cloneElement(children, {
      [eventPropName]: this.onEventWithTracking,
    });
  }
}

EventTracker.propTypes = {
  children: PropTypes.node.isRequired, // single child
  eventPropName: PropTypes.string,
  eventId: PropTypes.string.isRequired,
  extractEventArgsToForward: PropTypes.func,
};

EventTracker.defaultProps = {
  eventPropName: 'onClick',
  extractEventArgsToForward: null,
};

export default EventTracker;

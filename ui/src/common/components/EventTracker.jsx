import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { trackEvent } from '../../tracker';

class EventTracker extends Component {
  constructor(props) {
    super(props);

    this.onEventWithTracking = this.onEventWithTracking.bind(this);
  }

  onEventWithTracking(...eventArgs) {
    const { children, eventId, eventPropName } = this.props;
    trackEvent('User', eventPropName, eventId);

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
};

EventTracker.defaultProps = {
  eventPropName: 'onClick',
};

export default EventTracker;

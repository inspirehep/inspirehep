import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { trackEvent } from '../../tracker';

class EventTracker extends Component {
  constructor(props: any) {
    super(props);

    this.onEventWithTracking = this.onEventWithTracking.bind(this);
  }

  onEventWithTracking(...eventArgs: any[]) {
    const {
      children,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'eventId' does not exist on type 'Readonl... Remove this comment to see the full error message
      eventId,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'eventPropName' does not exist on type 'R... Remove this comment to see the full error message
      eventPropName,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'extractEventArgsToForward' does not exis... Remove this comment to see the full error message
      extractEventArgsToForward,
    } = this.props;

    const eventInfo = extractEventArgsToForward
      ? [eventId, extractEventArgsToForward(eventArgs)]
      : eventId;
    trackEvent('User', eventPropName, eventInfo);

    // @ts-expect-error ts-migrate(2533) FIXME: Object is possibly 'null' or 'undefined'.
    if (children.props[eventPropName]) {
      // @ts-expect-error ts-migrate(2533) FIXME: Object is possibly 'null' or 'undefined'.
      children.props[eventPropName](...eventArgs);
    }
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'eventPropName' does not exist on type 'R... Remove this comment to see the full error message
    const { children, eventPropName } = this.props;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return React.cloneElement(children, {
      [eventPropName]: this.onEventWithTracking,
    });
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
EventTracker.propTypes = {
  children: PropTypes.node.isRequired, // single child
  eventPropName: PropTypes.string,
  eventId: PropTypes.string.isRequired,
  extractEventArgsToForward: PropTypes.func,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
EventTracker.defaultProps = {
  eventPropName: 'onClick',
  extractEventArgsToForward: null,
};

export default EventTracker;

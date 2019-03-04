import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Set } from 'immutable';

import { trackEvent } from '../../tracker';
import { isSuperUser, isCataloger } from '../authorization';

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
    trackEvent(this.getUserEventCategory(), eventPropName, eventInfo);

    if (children.props[eventPropName]) {
      children.props[eventPropName](...eventArgs);
    }
  }

  getUserEventCategory() {
    const { userRoles } = this.props;
    if (isSuperUser(userRoles)) {
      return 'Superuser';
    }

    if (isCataloger(userRoles)) {
      return 'Cataloger';
    }

    return 'User';
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
  userRoles: PropTypes.instanceOf(Set).isRequired,
};

EventTracker.defaultProps = {
  eventPropName: 'onClick',
  extractEventArgsToForward: null,
};

const stateToProps = state => ({
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(EventTracker);

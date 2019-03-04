import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Set } from 'immutable';

import { isCataloger } from '../authorization';
import ListItemAction from '../components/ListItemAction';
import EventTracker from './EventTracker';

class EditRecordActionContainer extends Component {
  render() {
    const { userRoles, recordId } = this.props;
    const isUserCataloger = isCataloger(userRoles);
    const href = `/workflows/edit_article/${recordId}`;
    if (isUserCataloger) {
      return (
        <EventTracker eventId="Edit">
          <ListItemAction
            iconType="edit"
            text="edit"
            link={{
              href,
              target: '_blank',
            }}
          />
        </EventTracker>
      );
    }
    return null;
  }
}

EditRecordActionContainer.propTypes = {
  userRoles: PropTypes.instanceOf(Set).isRequired,
  recordId: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(EditRecordActionContainer);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Set } from 'immutable';
import { doSetsHaveCommonItem } from '../utils';
import ListItemAction from '../../common/components/ListItemAction';

const ONLY_SUPER_USERS_AND_CATALOGERS = Set(['superuser', 'cataloger']);

class EditRecordActionContainer extends Component {
  render() {
    const { userRoles, recordId } = this.props;
    const isAuthorized = doSetsHaveCommonItem(
      userRoles,
      ONLY_SUPER_USERS_AND_CATALOGERS
    );
    const href = `/workflows/edit_article/${recordId}`;
    if (isAuthorized) {
      return (
        <ListItemAction
          iconType="edit"
          text="edit"
          link={{
            href,
            target: '_blank',
          }}
        />
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

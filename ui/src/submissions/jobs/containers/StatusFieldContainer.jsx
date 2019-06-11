import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Set } from 'immutable';
import PropTypes from 'prop-types';
import SelectField from '../../common/components/SelectField';
import { SUBMISSIONS_JOB } from '../../../common/routes';
import { isCataloger } from '../../../common/authorization';
import { statusOptions, unAuthorizedStatusOptions } from '../schemas/constants';

class StatusField extends Component {
  render() {
    const { isCatalogerLoggedIn, isUpdateSubmission, ...selectFieldProps } = this.props;

    const disabled = !isUpdateSubmission && !isCatalogerLoggedIn;
    const options = isCatalogerLoggedIn
      ? statusOptions
      : unAuthorizedStatusOptions;

    return (
      <SelectField
        {...selectFieldProps}
        disabled={disabled}
        options={options}
      />
    );
  }
}

StatusField.propTypes = {
  isUpdateSubmission: PropTypes.bool.isRequired,
  isCatalogerLoggedIn: PropTypes.bool.isRequired,
};

export const stateToProps = state => ({
  isCatalogerLoggedIn: isCataloger(Set(state.user.getIn(['data', 'roles']))),
  isUpdateSubmission: String(state.router.location.pathname).startsWith(
    `${SUBMISSIONS_JOB}/`
  ),
});

export default connect(stateToProps)(StatusField);

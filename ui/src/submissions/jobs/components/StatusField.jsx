import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectField from '../../common/components/SelectField';
import { statusOptions, unAuthorizedStatusOptions } from '../schemas/constants';

class StatusField extends Component {
  render() {
    const {
      isCatalogerLoggedIn,
      isUpdateSubmission,
      ...selectFieldProps
    } = this.props;

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

export default StatusField;

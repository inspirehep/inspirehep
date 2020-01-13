import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectField from '../../common/components/SelectField';
import { statusOptions, unAuthorizedStatusOptions } from '../schemas/constants';

class StatusField extends Component {
  render() {
    const { isCatalogerLoggedIn, canModify, ...selectFieldProps } = this.props;

    const options = isCatalogerLoggedIn
      ? statusOptions
      : unAuthorizedStatusOptions;

    return (
      <SelectField
        {...selectFieldProps}
        disabled={!canModify}
        options={options}
      />
    );
  }
}

StatusField.propTypes = {
  isCatalogerLoggedIn: PropTypes.bool.isRequired,
  canModify: PropTypes.bool.isRequired,
};

export default StatusField;

import React, { Component } from 'react';

import SelectField from '../../common/components/SelectField';
import { statusOptions, unAuthorizedStatusOptions } from '../schemas/constants';

type Props = {
    isCatalogerLoggedIn: boolean;
    canModify: boolean;
};

class StatusField extends Component<Props> {

  render() {
    const { isCatalogerLoggedIn, canModify, ...selectFieldProps } = this.props;

    const options = isCatalogerLoggedIn
      ? statusOptions
      : unAuthorizedStatusOptions;

    return (
      <SelectField
        {...selectFieldProps}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        disabled={!canModify}
        options={options}
      />
    );
  }
}

export default StatusField;

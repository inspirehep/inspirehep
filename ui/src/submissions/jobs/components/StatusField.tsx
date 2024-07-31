import React from 'react';

import SelectField from '../../common/components/SelectField';
import { statusOptions, unAuthorizedStatusOptions } from '../schemas/constants';

function StatusField(props: any) {
  const { isCatalogerLoggedIn, canModify, ...selectFieldProps } = props;

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

export default StatusField;

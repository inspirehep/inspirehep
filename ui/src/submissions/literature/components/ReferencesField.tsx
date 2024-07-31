import React from 'react';
import { Field } from 'formik';

import TextAreaField from '../../common/components/TextAreaField';

function ReferencesField({ values }: { values?: any }) {
  return (
    <Field
      name="references"
      label="References"
      placeholder="References in plain text format"
      rows={8}
      component={TextAreaField}
    />
  );
}

export default ReferencesField;

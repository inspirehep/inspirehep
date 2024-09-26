import React, { Component } from 'react';
import { Field } from 'formik';

import TextAreaField from '../../common/components/TextAreaField';

class ReferencesField extends Component {
  render() {
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
}

export default ReferencesField;

import React, { Component } from 'react';
import { Field } from 'formik';

import TextAreaField from '../../common/components/TextAreaField';
import LabelWithHelp from '../../../common/components/LabelWithHelp';

class CommentsField extends Component {
  render() {
    return (
      <Field
        name="comments"
        label={
          <LabelWithHelp
            label="Comments"
            help="Why is this content relevant to INSPIRE?"
          />
        }
        placeholder="Any extra comments related to your submission"
        rows={6}
        component={TextAreaField}
      />
    );
  }
}

export default CommentsField;

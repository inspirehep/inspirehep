import React, { Component } from 'react';
import { Field } from 'formik';
import { Tooltip } from 'antd';

import TextAreaField from '../../common/components/TextAreaField';
import LabelWithHelp from '../../../common/components/LabelWithHelp';

class CommentsField extends Component {
  render() {
    return (
      <Field
        name="comments"
        label={
          <LabelWithHelp
            label={
              <Tooltip title="Why is this content relevant to INSPIRE?">
                Comments
              </Tooltip>
            }
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

import React, { Component } from 'react';
import { Field } from 'formik';
import { Tooltip } from 'antd';

import TextField from '../../common/components/TextField';
import LabelWithHelp from '../../../common/components/LabelWithHelp';

class LinkFields extends Component {
  render() {
    return (
      <>
        <Field
          name="pdf_link"
          label={
            <LabelWithHelp
              label={
                <Tooltip title="Where can we find a PDF to check the references?">
                  Link to PDF
                </Tooltip>
              }
              help="Where can we find a PDF to check the references?"
            />
          }
          placeholder="https://example.com/document.pdf"
          component={TextField}
        />
        <Field
          name="additional_link"
          label={
            <LabelWithHelp
              label={
                <Tooltip title="Link to additional information (eg. abstract): Which page should we link from INSPIRE?">
                  Link to additional info
                </Tooltip>
              }
              help="Link to additional information (eg. abstract): Which page should we link from INSPIRE?"
            />
          }
          placeholder="https://example.com/page.html"
          component={TextField}
        />
      </>
    );
  }
}

export default LinkFields;

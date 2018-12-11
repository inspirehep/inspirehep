import React, { Component } from 'react';
import { Field } from 'formik';

import TextField from '../../common/components/TextField';
import LabelWithHelp from '../../common/components/LabelWithHelp';

class LinkFields extends Component {
  render() {
    return (
      <>
        <Field
          name="pdf_link"
          label="Link to PDF"
          placeholder="https://example.com/document.pdf"
          component={TextField}
        />
        <Field
          name="additional_link"
          label={
            <LabelWithHelp
              label="Link to additional info"
              help="e.g. abstract"
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

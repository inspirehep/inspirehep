import React, { Component } from 'react';
import { Form, Field } from 'formik';
import { Row } from 'antd';
import PropTypes from 'prop-types';

import CollapsableForm from '../../common/components/CollapsableForm';
import BasicInfoFields from './BasicInfoFields';
import SubmitButton from '../../common/components/SubmitButton';
import LinkFields from './LinkFields';
import ReferencesField from './ReferencesField';
import CommentsField from './CommentsField';
import TextField from '../../common/components/TextField';

const OPEN_SECTIONS = ['basic_info', 'links', 'publication_info'];

class BookForm extends Component {
  render() {
    const { values, isSubmitting, isValid, isValidating } = this.props;
    return (
      <Form>
        <CollapsableForm openSections={OPEN_SECTIONS}>
          <CollapsableForm.Section header="Links" key="links">
            <LinkFields />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Basic Info" key="basic_info">
            <BasicInfoFields values={values} />
          </CollapsableForm.Section>
          <CollapsableForm.Section
            header="Publication Info"
            key="publication_info"
          >
            <Field
              name="series_title"
              label="Series Title"
              component={TextField}
            />
            <Field name="volume" label="Volume" component={TextField} />
            <Field
              name="publication_date"
              label="Publication Date"
              placeholder="YYYY-MM-DD, YYYY-MM or YYYY"
              component={TextField}
            />
            <Field name="publisher" label="Publisher" component={TextField} />
            <Field
              name="publication_place"
              label="Publication Place"
              component={TextField}
            />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="References" key="references">
            <ReferencesField values={values} />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Comments" key="comments">
            <CommentsField values={values} />
          </CollapsableForm.Section>
        </CollapsableForm>
        <Row type="flex" justify="end">
          <SubmitButton
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            isValid={isValid}
          />
        </Row>
      </Form>
    );
  }
}

BookForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default BookForm;

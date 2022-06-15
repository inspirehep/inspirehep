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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values } = this.props;
    return (
      <Form>
        {/* @ts-ignore */}
        <CollapsableForm openSections={OPEN_SECTIONS}>
          {/* @ts-ignore */}
          <CollapsableForm.Section header="Links" key="links">
            <LinkFields />
          {/* @ts-ignore */}
          </CollapsableForm.Section>
          {/* @ts-ignore */}
          <CollapsableForm.Section header="Basic Info" key="basic_info">
            {/* @ts-ignore */}
            <BasicInfoFields values={values} />
          {/* @ts-ignore */}
          </CollapsableForm.Section>
          {/* @ts-ignore */}
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
          {/* @ts-ignore */}
          </CollapsableForm.Section>
          {/* @ts-ignore */}
          <CollapsableForm.Section header="References" key="references">
            {/* @ts-ignore */}
            <ReferencesField values={values} />
          {/* @ts-ignore */}
          </CollapsableForm.Section>
          {/* @ts-ignore */}
          <CollapsableForm.Section header="Comments" key="comments">
            {/* @ts-ignore */}
            <CommentsField values={values} />
          {/* @ts-ignore */}
          </CollapsableForm.Section>
        </CollapsableForm>
        {/* @ts-ignore */}
        <Row type="flex" justify="end">
          <SubmitButton />
        </Row>
      </Form>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
BookForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default BookForm;

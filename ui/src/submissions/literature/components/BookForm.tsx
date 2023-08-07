import React from 'react';
import { Form, Field } from 'formik';
import { Row } from 'antd';

import CollapsableForm from '../../common/components/CollapsableForm';
import BasicInfoFields from './BasicInfoFields';
import SubmitButton from '../../common/components/SubmitButton';
import LinkFields from './LinkFields';
import ReferencesField from './ReferencesField';
import CommentsField from './CommentsField';
import TextField from '../../common/components/TextField';

const OPEN_SECTIONS = ['basic_info', 'links', 'publication_info'];

function BookForm({ values }: { values: any }) {
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
      <Row justify="end">
        <SubmitButton />
      </Row>
    </Form>
  );
}

export default BookForm;

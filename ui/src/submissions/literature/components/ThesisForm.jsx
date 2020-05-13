import React, { Component } from 'react';
import { Form } from 'formik';
import { Row } from 'antd';
import PropTypes from 'prop-types';

import CollapsableForm from '../../common/components/CollapsableForm';
import BasicInfoFields from './BasicInfoFields';
import SubmitButton from '../../common/components/SubmitButton';
import LinkFields from './LinkFields';
import ThesisInfoFields from './ThesisInfoFields';
import ReferencesField from './ReferencesField';
import CommentsField from './CommentsField';

const OPEN_SECTIONS = ['basic_info', 'links', 'thesis_info'];

class ThesisForm extends Component {
  render() {
    const { values } = this.props;
    return (
      <Form>
        <CollapsableForm openSections={OPEN_SECTIONS}>
          <CollapsableForm.Section header="Links" key="links">
            <LinkFields />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Basic Info" key="basic_info">
            <BasicInfoFields values={values} />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Thesis Info" key="thesis_info">
            <ThesisInfoFields values={values} />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="References" key="references">
            <ReferencesField values={values} />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Comments" key="comments">
            <CommentsField values={values} />
          </CollapsableForm.Section>
        </CollapsableForm>
        <Row type="flex" justify="end">
          <SubmitButton />
        </Row>
      </Form>
    );
  }
}

ThesisForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ThesisForm;

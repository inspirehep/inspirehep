import React, { Component } from 'react';
import { Form } from 'formik';
import { Row } from 'antd';
import PropTypes from 'prop-types';

import CollapsableForm from '../../common/components/CollapsableForm';
import BasicInfoFields from './BasicInfoFields';
import SubmitButton from '../../common/components/SubmitButton';
import LinkFields from './LinkFields';
import ThesisInfoFields from './ThesisInfoFields';

const OPEN_SECTIONS = ['basic_info', 'links', 'thesis_info'];

class ThesisForm extends Component {
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
          <CollapsableForm.Section header="Thesis Info" key="thesis_info">
            <ThesisInfoFields values={values} />
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

ThesisForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ThesisForm;

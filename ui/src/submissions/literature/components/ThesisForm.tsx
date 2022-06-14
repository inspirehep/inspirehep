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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values } = this.props;
    return (
      <Form>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <CollapsableForm openSections={OPEN_SECTIONS}>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="Links" key="links">
            <LinkFields />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="Basic Info" key="basic_info">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <BasicInfoFields values={values} />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="Thesis Info" key="thesis_info">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <ThesisInfoFields values={values} />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="References" key="references">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <ReferencesField values={values} />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="Comments" key="comments">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <CommentsField values={values} />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
        </CollapsableForm>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Row type="flex" justify="end">
          <SubmitButton />
        </Row>
      </Form>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ThesisForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ThesisForm;

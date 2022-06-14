import React, { Component } from 'react';
import { Form } from 'formik';
import { Row } from 'antd';

import CollapsableForm from '../../common/components/CollapsableForm';
import BasicInfoFields from './BasicInfoFields';
import SubmitButton from '../../common/components/SubmitButton';
import LinkFields from './LinkFields';
import ThesisInfoFields from './ThesisInfoFields';
import ReferencesField from './ReferencesField';
import CommentsField from './CommentsField';

const OPEN_SECTIONS = ['basic_info', 'links', 'thesis_info'];

type Props = {
    values: {
        [key: string]: $TSFixMe;
    };
};

class ThesisForm extends Component<Props> {

  render() {
    const { values } = this.props;
    // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
    return (<Form>
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <CollapsableForm openSections={OPEN_SECTIONS}>
          <(CollapsableForm as $TSFixMe).Section header="Links" key="links">
            <LinkFields />
          </(CollapsableForm as $TSFixMe).Section>
          <(CollapsableForm as $TSFixMe).Section header="Basic Info" key="basic_info">
            <BasicInfoFields values={values}/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="Thesis Info" key="thesis_info">
            <ThesisInfoFields values={values}/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="References" key="references">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <ReferencesField values={values}/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="Comments" key="comments">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <CommentsField values={values}/>
          </(CollapsableForm as $TSFixMe).Section>
        // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'typeof Co... Remove this comment to see the full error message
        </CollapsableForm>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Row type="flex" justify="end">
          <SubmitButton />
        </Row>
      </Form>);
  }
}

export default ThesisForm;

import React from 'react';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import ConferenceForm from './ConferenceForm';
import conferenceSchema from '../schemas/conference';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = conferenceSchema.cast();

type Props = {
    error?: {
        [key: string]: $TSFixMe;
    };
    initialFormData?: {
        [key: string]: $TSFixMe;
    };
    onSubmit: $TSFixMeFunction;
};

// @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type '{ [key: str... Remove this comment to see the full error message
function ConferenceSubmission({ onSubmit, error = null }: Props) {
  const onFormikSubmit = useSubmitCallback(onSubmit);
  return (
    <div>
      {error && (
        <Row className="mb3">
          <Col span={24}>
            <Alert message={error.message} type="error" showIcon closable />
          </Col>
        </Row>
      )}
      <Row>
        <Col span={24}>
          <Formik
            initialValues={DEFAULT_FORM_DATA}
            validationSchema={conferenceSchema}
            onSubmit={onFormikSubmit}
            validateOnChange={false}
            component={ConferenceForm}
          />
        </Col>
      </Row>
    </div>
  );
}

export default convertAllImmutablePropsToJS(ConferenceSubmission);

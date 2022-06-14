import React from 'react';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object } from 'yup';

import JobForm from './JobForm';
import jobSchema from '../schemas/job';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = jobSchema.cast();

type Props = {
    error?: {
        [key: string]: $TSFixMe;
    };
    initialFormData?: {
        [key: string]: $TSFixMe;
    };
    onSubmit: $TSFixMeFunction;
    extendSchema?: $TSFixMe; // TODO: PropTypes.instanceOf(object)
};

// @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type '{ [key: str... Remove this comment to see the full error message
function JobSubmission({ onSubmit, initialFormData = {}, extendSchema = object(), error = null, }: Props) {
  const initialValues = {
    ...DEFAULT_FORM_DATA,
    ...initialFormData,
  };
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
            initialValues={initialValues}
            validationSchema={jobSchema.concat(extendSchema)}
            onSubmit={onFormikSubmit}
            validateOnChange={false}
            component={JobForm}
          />
        </Col>
      </Row>
    </div>
  );
}

export default convertAllImmutablePropsToJS(JobSubmission);

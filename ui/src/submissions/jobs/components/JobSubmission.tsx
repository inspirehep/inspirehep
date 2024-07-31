import React from 'react';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';
import { object, ObjectSchema } from 'yup';

import JobForm from './JobForm';
import jobSchema from '../schemas/job';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = jobSchema.cast();

function JobSubmission({
  onSubmit,
  initialFormData = {},
  extendSchema = object(),
  error = null,
}: {
  onSubmit: Function;
  initialFormData: any;
  extendSchema: ObjectSchema<object, object> | object;
  error: { message: string } | null;
}) {
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
            // @ts-expect-error
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

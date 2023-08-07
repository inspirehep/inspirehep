import React from 'react';
import { Row, Col, Alert } from 'antd';
import { Formik, FormikValues } from 'formik';

import ExperimentForm from './ExperimentForm';
import experimentSchema from '../schemas/experiment';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = experimentSchema.cast();

const ExperimentSubmission = ({
  onSubmit,
  error = null,
}: {
  onSubmit: Function;
  error: { message: string } | null;
}) => {
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
            initialValues={DEFAULT_FORM_DATA as FormikValues}
            validationSchema={experimentSchema}
            onSubmit={onFormikSubmit}
            validateOnChange={false}
            component={ExperimentForm}
          />
        </Col>
      </Row>
    </div>
  );
};

export default convertAllImmutablePropsToJS(ExperimentSubmission);

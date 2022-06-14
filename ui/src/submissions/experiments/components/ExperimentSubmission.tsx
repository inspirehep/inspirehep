import React from 'react';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import ExperimentForm from './ExperimentForm';
import experimentSchema from '../schemas/experiment';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = experimentSchema.cast();

type Props = {
    error?: {
        [key: string]: $TSFixMe;
    };
    onSubmit: $TSFixMeFunction;
};

// @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type '{ [key: str... Remove this comment to see the full error message
const ExperimentSubmission = ({ onSubmit, error = null, }: Props) => {
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
            validationSchema={experimentSchema}
            onSubmit={onFormikSubmit}
            validateOnChange={false}
            component={ExperimentForm}
          />
        </Col>
      </Row>
    </div>
  );
}

export default convertAllImmutablePropsToJS(ExperimentSubmission);

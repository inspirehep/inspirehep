import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import ExperimentForm from './ExperimentForm';
import experimentSchema from '../schemas/experiment';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = experimentSchema.cast();

const ExperimentSubmission = ({
  onSubmit,
  error = null,
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

ExperimentSubmission.propTypes = {
  error: PropTypes.objectOf(PropTypes.any),
  onSubmit: PropTypes.func.isRequired,
};

export default convertAllImmutablePropsToJS(ExperimentSubmission);

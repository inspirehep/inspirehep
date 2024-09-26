import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import SeminarForm from './SeminarForm';
import seminarSubmission from '../schemas/seminar';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = seminarSubmission.cast();

function SeminarSubmission({ onSubmit, initialFormData = {}, error = null }) {
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
            validationSchema={seminarSubmission}
            onSubmit={onFormikSubmit}
            validateOnChange={false}
            component={SeminarForm}
          />
        </Col>
      </Row>
    </div>
  );
}

SeminarSubmission.propTypes = {
  error: PropTypes.objectOf(PropTypes.any), // must have 'message'
  initialFormData: PropTypes.objectOf(PropTypes.any),
  onSubmit: PropTypes.func.isRequired, // must be async
};

export default convertAllImmutablePropsToJS(SeminarSubmission);

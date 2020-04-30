import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import SeminarForm from './SeminarForm';
import seminarSubmission from '../schemas/seminar';
import cleanupFormData from '../../common/cleanupFormData';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useIsMounted from '../../../common/hooks/useIsMounted';

const DEFAULT_FORM_DATA = seminarSubmission.cast();

function SeminarSubmission({ onSubmit, initialFormData = {}, error = null }) {
  const isMounted = useIsMounted();
  const initialValues = {
    ...DEFAULT_FORM_DATA,
    ...initialFormData,
  };

  const onFormikSubmit = useCallback(
    async (values, actions) => {
      const cleanValues = cleanupFormData(values);
      await onSubmit(cleanValues);
      if (isMounted) {
        actions.setSubmitting(false);
        window.scrollTo(0, 0);
      }
    },
    [onSubmit, isMounted]
  );
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

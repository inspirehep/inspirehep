import React from 'react'
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import InstitutionForm from './InstitutionForm';
import institutionSchema from '../schemas/institution';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = institutionSchema.cast();

const InstitutionSubmission = ({
  onSubmit,
  error = null,
}) => {
  const onFormikSubmit = useSubmitCallback(onSubmit);
  const modifyFormData = (formData) => ({...formData, ICN: [formData.identifier], legacy_ICN: formData.identifier});

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
            validationSchema={institutionSchema}
            onSubmit={data => onFormikSubmit(modifyFormData(data))}
            validateOnChange={false}
            component={InstitutionForm}
          />
        </Col>
      </Row>
    </div>
  );
};

InstitutionSubmission.propTypes = {
  error: PropTypes.objectOf(PropTypes.any),
  onSubmit: PropTypes.func.isRequired,
};

export default convertAllImmutablePropsToJS(InstitutionSubmission);

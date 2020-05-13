import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';
import { object } from 'yup';

import AuthorForm from './AuthorForm';
import authorSchema from '../schemas/author';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = authorSchema.cast();

function AuthorSubmission({
  onSubmit,
  error = null,
  initialFormData = {},
  extendSchema = object(),
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
            validationSchema={authorSchema.concat(extendSchema)}
            onSubmit={onFormikSubmit}
            validateOnChange={false}
            component={AuthorForm}
          />
        </Col>
      </Row>
    </div>
  );
}

AuthorSubmission.propTypes = {
  error: PropTypes.objectOf(PropTypes.any), // must have 'message'
  initialFormData: PropTypes.objectOf(PropTypes.any),
  onSubmit: PropTypes.func.isRequired, // must be async
  extendSchema: PropTypes.instanceOf(object),
};

export default convertAllImmutablePropsToJS(AuthorSubmission);

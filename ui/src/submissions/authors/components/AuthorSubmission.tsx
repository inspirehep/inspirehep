import React from 'react';
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
  isCatalogerLoggedIn,
  isUpdate,
}: {
  onSubmit: Function;
  error: any | null;
  initialFormData: any;
  extendSchema: any;
  isCatalogerLoggedIn: boolean;
  isUpdate: boolean;
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
            <Alert message={error.message ? error.message : 'Something went wrong.'} type="error" showIcon closable />
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
            isCatalogerLoggedIn={isCatalogerLoggedIn}
            isUpdate={isUpdate}
          >
            {({ values }) => (
              <AuthorForm
                values={values}
                isUpdate={isUpdate}
                isCatalogerLoggedIn={isCatalogerLoggedIn}
              />
            )}
          </Formik>
        </Col>
      </Row>
    </div>
  );
}

export default convertAllImmutablePropsToJS(AuthorSubmission);

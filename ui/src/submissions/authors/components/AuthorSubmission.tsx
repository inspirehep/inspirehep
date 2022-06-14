import React from 'react';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object } from 'yup';

import AuthorForm from './AuthorForm';
import authorSchema from '../schemas/author';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = authorSchema.cast();

type Props = {
    error?: {
        [key: string]: $TSFixMe;
    };
    initialFormData?: {
        [key: string]: $TSFixMe;
    };
    onSubmit: $TSFixMeFunction;
    extendSchema?: $TSFixMe; // TODO: PropTypes.instanceOf(object)
    isCatalogerLoggedIn?: boolean;
    isUpdate?: boolean;
};

// @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type '{ [key: str... Remove this comment to see the full error message
function AuthorSubmission({ onSubmit, error = null, initialFormData = {}, extendSchema = object(), isCatalogerLoggedIn, isUpdate, }: Props) {
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
            isCatalogerLoggedIn={isCatalogerLoggedIn}
            isUpdate={isUpdate}
          >
            {({ values }) => (
              // @ts-expect-error ts-migrate(2786) FIXME: 'AuthorForm' cannot be used as a JSX component.
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

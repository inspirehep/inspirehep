import React from 'react'
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import InstitutionForm from './InstitutionForm';
import institutionSchema from '../schemas/institution';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

const DEFAULT_FORM_DATA = institutionSchema.cast();

type Props = {
    error?: {
        [key: string]: $TSFixMe;
    };
    onSubmit: $TSFixMeFunction;
};

// @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type '{ [key: str... Remove this comment to see the full error message
const InstitutionSubmission = ({ onSubmit, error = null, }: Props) => {
  const onFormikSubmit = useSubmitCallback(onSubmit);
  const modifyFormData = (formData: $TSFixMe) => ({
    ...formData,
    ICN: [formData.identifier],
    legacy_ICN: formData.identifier
  });

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
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            onSubmit={data => onFormikSubmit(modifyFormData(data))}
            validateOnChange={false}
            component={InstitutionForm}
          />
        </Col>
      </Row>
    </div>
  );
};

export default convertAllImmutablePropsToJS(InstitutionSubmission);

import React from 'react';
import { Row, Col, Alert } from 'antd';
import { Formik, FormikValues } from 'formik';

import { JournalForm } from './JournalForm';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';
import { journalSchema, DEFAULT_FORM_DATA } from '../schemas/journal';
import { JournalFormData } from '../containers/JournalSubmissionPageContainer';

export const JournalSubmission = ({
  error,
  onSubmit,
}: { error: string } & {
  onSubmit(formData: JournalFormData): Promise<void>;
}) => {
  const onFormikSubmit = useSubmitCallback(onSubmit);
  const modifyFormData = (data: FormikValues) => ({
    ...data,
    short_title: data.short_title,
    journal_title: { title: data.journal_title },
  });

  return (
    <div>
      {error && (
        <Row className="mb3">
          <Col span={24}>
            <Alert message={error} type="error" showIcon closable />
          </Col>
        </Row>
      )}
      <Row>
        <Col span={24}>
          <Formik
            initialValues={DEFAULT_FORM_DATA}
            validationSchema={journalSchema}
            onSubmit={(data) => onFormikSubmit(modifyFormData(data))}
            validateOnChange={false}
            component={JournalForm}
          />
        </Col>
      </Row>
    </div>
  );
};

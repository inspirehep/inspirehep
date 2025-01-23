import React from 'react';
import { Field, Form } from 'formik';
import { Row, Col } from 'antd';

import SubmitButton from '../../common/components/SubmitButton';
import TextField from '../../common/components/TextField';

export const JournalForm = () => (
  <Form className="bg-white pa3">
    <Row className="mb3 pt2 bg-white">
      <Col span={24}>
        <Field name="short_title" label="* Short title" component={TextField} />
        <Field
          name="journal_title"
          label="* Journal Title"
          component={TextField}
        />
      </Col>
    </Row>

    <Row justify="end">
      <SubmitButton />
    </Row>
  </Form>
);

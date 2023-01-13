import React from 'react';
import { Button } from 'antd';
import { Formik, Field, Form } from 'formik';
import { object, string } from 'yup';

import './ChangeEmailForm.less';
import { Credentials } from '../../../types';
import TextField from '../../../submissions/common/components/TextField';
import EventTracker from '../../../common/components/EventTracker';

const SCHEMA = object().shape({
  email: string().email().trim().required().label('Email'),
});

export const ChangeEmailForm = ({
  onChangeEmailAddress,
  loading,
  email,
}: {
  onChangeEmailAddress: ((credentials: Credentials) => void | Promise<any>) &
    Function;
  loading: boolean;
  email?: string;
}) => {
  return (
    <Formik
      validationSchema={SCHEMA}
      validateOnBlur
      validateOnChange={false}
      onSubmit={onChangeEmailAddress}
      initialValues={{ email }}
    >
      {(props) => (
        <Form>
          <p>
            Change the email address associated to your INSPIRE account. This is
            used by the INSPIRE system to contact you automatically (e.g. job ad
            closing, submission confirmation, etc.).
          </p>
          <div className="pt3 flex">
            <div style={{ flex: 12 }}>
              <Field
                name="email"
                type="email"
                placeholder="Email"
                data-test-id="email"
                component={TextField}
                className="w-100 mb0"
              />
            </div>
            <EventTracker
              eventCategory="Settings"
              eventAction="Edit"
              eventId="Change user password"
            >
              <Button
                loading={loading}
                disabled={!props.isValid || !props.dirty}
                type="primary"
                htmlType="submit"
                data-test-id="submit-email"
                style={{ flex: 1 }}
              >
                Change
              </Button>
            </EventTracker>
          </div>
        </Form>
      )}
    </Formik>
  );
};

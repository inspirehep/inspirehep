import React from 'react';
import { Field, useFormikContext } from 'formik';
import { Row, Col } from 'antd';


import ArrayOf from './ArrayOf';
import TextField from './TextField';
import AuthorSuggesterField from './AuthorSuggesterField';

type Props = {
    label?: string;
    name?: string;
};


function ContactsField({ label = 'Contact Detail(s)', name = 'contacts' }: Props) {
  const { values } = useFormikContext();
  return (
    <ArrayOf
      label={label}
      name={name}
      emptyItem={{}}
      values={values}
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      renderItem={(itemName: $TSFixMe) => <Row type="flex" justify="space-between">
        <Col span={11}>
          <AuthorSuggesterField
            onlyChild
            name={`${itemName}.name`}
            recordFieldPath={`${itemName}.record`}
            placeholder="Name"
          />
        </Col>
        <Col span={11}>
          <Field
            onlyChild
            name={`${itemName}.email`}
            placeholder="Email"
            component={TextField}
          />
        </Col>
      </Row>}
    />
  );
}


export default ContactsField;

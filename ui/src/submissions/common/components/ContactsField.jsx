import React from 'react';
import PropTypes from 'prop-types';
import { Field, useFormikContext } from 'formik';
import { Row, Col } from 'antd';


import ArrayOf from './ArrayOf';
import TextField from './TextField';
import AuthorSuggesterField from './AuthorSuggesterField';


function ContactsField({ label = 'Contact Detail(s)', name = 'contacts' }) {
  const { values } = useFormikContext();
  return (
    <ArrayOf
      label={label}
      name={name}
      emptyItem={{}}
      values={values}
      renderItem={itemName => (
        <Row type="flex" justify="space-between">
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
        </Row>
      )}
    />
  );
}


ContactsField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
};


export default ContactsField;

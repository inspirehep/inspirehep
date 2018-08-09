import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Button, Col, Row } from 'antd';

import TextField from './TextField';
import BooleanField from './BooleanField';
import SelectField from './SelectField';
// import NumberField from './NumberField';
import ArrayOf from './ArrayOf';
import { fieldOfResearchOptions, rankOptions } from '../schemas/constants';
import SuggesterField from './SuggesterField';

class AuthorForm extends Component {
  render() {
    const { isSubmitting, values } = this.props;
    return (
      <Form>
        <Field name="display_name" label="Display Name" component={TextField} />
        <Field
          name="email"
          label="Email"
          placeholder="dude@thing.amk"
          component={TextField}
        />
        <Field
          name="field_of_research"
          label="Field of Research"
          mode="multiple"
          options={fieldOfResearchOptions}
          component={SelectField}
        />
        <ArrayOf
          values={values}
          label="Websites"
          name="websites"
          renderItem={itemName => (
            <Field
              wrapperCol={{ span: 24 }}
              name={itemName}
              placeholder="website"
              component={TextField}
            />
          )}
        />
        <ArrayOf
          values={values}
          label="Instituion History"
          name="institution_history"
          renderItem={itemName => (
            <Row type="flex" justify="space-between">
              <Col span={11}>
                <Field
                  inline
                  name={`${itemName}.institution`}
                  placeholder="institution"
                  pidType="institutions"
                  suggesterName="affiliation"
                  component={SuggesterField}
                />
              </Col>
              <Col span={11}>
                <Field
                  inline
                  name={`${itemName}.rank`}
                  placeholder="rank"
                  options={rankOptions}
                  component={SelectField}
                />
              </Col>
              <Col span={11}>
                <Field
                  inline
                  name={`${itemName}.start_year`}
                  placeholder="start year"
                  component={TextField}
                />
              </Col>
              <Col span={11}>
                <Field
                  inline
                  name={`${itemName}.end_year`}
                  placeholder="end year"
                  component={TextField}
                />
              </Col>
              <Col span={11}>
                <Field
                  inline
                  name="current"
                  suffixText="Current"
                  component={BooleanField}
                />
              </Col>
            </Row>
          )}
        />
        <Button type="primary" htmlType="submit" disabled={isSubmitting}>
          Submit
        </Button>
      </Form>
    );
  }
}

AuthorForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default AuthorForm;

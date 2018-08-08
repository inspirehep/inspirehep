import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Button } from 'antd';

import TextField from './TextField';
import BooleanField from './BooleanField';
import SelectField from './SelectField';
import NumberField from './NumberField';
import ArrayOf from './ArrayOf';
import {
  fieldOfResearchOptions,
  degreeTypeOptions,
} from '../schemas/constants';

class AuthorForm extends Component {
  render() {
    const { isSubmitting, values } = this.props;
    return (
      <Form>
        <Field name="full_name" label="Full Name" component={TextField} />
        <Field
          name="email"
          label="Email"
          placeholder="dude@thing.amk"
          component={TextField}
        />
        <Field name="current" label="Current" component={BooleanField} />
        <Field
          name="degree_type"
          label="Degree Type"
          options={degreeTypeOptions}
          component={SelectField}
        />
        <Field
          name="field_of_research"
          label="Field of Research"
          mode="multiple"
          options={fieldOfResearchOptions}
          component={SelectField}
        />
        <Field name="start_year" label="Start Year" component={NumberField} />
        <ArrayOf
          values={values}
          label="Instituion History"
          name="institution_history"
          emptyItem={{ institution: '' }}
          renderItem={itemName => (
            <Fragment>
              <Field
                name={`${itemName}.institution`}
                placeholder="institution"
                component={TextField}
              />
              <Field
                name={`${itemName}.current`}
                label="Current"
                component={BooleanField}
              />
            </Fragment>
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

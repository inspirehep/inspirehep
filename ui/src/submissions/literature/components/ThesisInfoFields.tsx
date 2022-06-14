import React, { Component } from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { degreeTypeOptions } from '../../common/schemas/constants';
import TextField from '../../common/components/TextField';
import SelectField from '../../common/components/SelectField';
import LiteratureAuthorsField from './LiteratureAuthorsField';

class ThesisInfoFields extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values } = this.props;

    return (
      <>
        <Field
          name="degree_type"
          label="Degree Type"
          options={degreeTypeOptions}
          component={SelectField}
        />
        <Field
          name="submission_date"
          label="Date of Submission"
          placeholder="YYYY-MM-DD, YYYY-MM or YYYY"
          component={TextField}
        />
        <Field
          name="defense_date"
          label="Date of Defense"
          placeholder="YYYY-MM-DD, YYYY-MM or YYYY"
          component={TextField}
        />
        <Field name="institution" label="Institution" component={TextField} />
        <LiteratureAuthorsField
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          values={values}
          name="supervisors"
          label="Supervisors"
        />
      </>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ThesisInfoFields.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ThesisInfoFields;

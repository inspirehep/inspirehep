import React, { Component } from 'react';
import { Field } from 'formik';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import { degreeTypeOptions } from '../../common/schemas/constants';
import TextField from '../../common/components/TextField';
import ArrayOf from '../../common/components/ArrayOf';
import SelectField from '../../common/components/SelectField';

class ThesisInfoFields extends Component {
  render() {
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
        <ArrayOf
          values={values}
          name="supervisors"
          label="Supervisors"
          emptyItem={{}}
          renderItem={itemName => (
            <Row type="flex" justify="space-between">
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.full_name`}
                  placeholder="Family name, First name"
                  component={TextField}
                />
              </Col>
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.affiliation`}
                  placeholder="Affiliation"
                  component={TextField}
                />
              </Col>
            </Row>
          )}
        />
      </>
    );
  }
}

ThesisInfoFields.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ThesisInfoFields;

import React, { Component } from 'react';
import { Field } from 'formik';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import { languageOptions, subjectOptions } from '../schemas/constants';
import TextField from '../../common/components/TextField';
import ArrayOf from '../../common/components/ArrayOf';
import SelectField from '../../common/components/SelectField';
import TextAreaField from '../../common/components/TextAreaField';

class BasicInfoFields extends Component {
  render() {
    const { withCollaborationField, values } = this.props;

    return (
      <>
        <Field name="title" label="* Title" component={TextField} />
        <Field
          name="language"
          label="* Language"
          options={languageOptions}
          component={SelectField}
        />
        <Field
          name="subjects"
          label="* Subjects"
          mode="multiple"
          options={subjectOptions}
          component={SelectField}
        />
        <ArrayOf
          values={values}
          name="authors"
          label="* Authors"
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
        {withCollaborationField && (
          <Field
            name="collaboration"
            label="Collaboration"
            component={TextField}
          />
        )}
        <Field name="experiment" label="Experiment" component={TextField} />
        <Field
          name="abstract"
          label="Abstract"
          rows={4}
          component={TextAreaField}
        />
        <ArrayOf
          values={values}
          name="report_numbers"
          label="Report Numbers"
          emptyItem=""
          renderItem={itemName => (
            <Field onlyChild name={itemName} component={TextField} />
          )}
        />
      </>
    );
  }
}

BasicInfoFields.propTypes = {
  withCollaborationField: PropTypes.bool,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

BasicInfoFields.defaultProps = {
  withCollaborationField: false,
};

export default BasicInfoFields;

import React, { Component } from 'react';
import { Field } from 'formik';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import { languageOptions, subjectOptions } from '../schemas/constants';
import TextField from '../../common/components/TextField';
import ArrayOf from '../../common/components/ArrayOf';
import SelectField from '../../common/components/SelectField';
import TextAreaField from '../../common/components/TextAreaField';
import SuggesterField from '../../common/components/SuggesterField';

class BasicInfoFields extends Component {
  static getSuggestionSourceLegacyICN(suggestion) {
    return suggestion._source.legacy_ICN;
  }

  static getSuggestionSourceLegacyName(suggestion) {
    return suggestion._source.legacy_name;
  }

  static getSuggestionSourceNameValue(suggestion) {
    return suggestion._source.name.value;
  }

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
                  recordFieldPath={`${itemName}.record`}
                  name={`${itemName}.full_name`}
                  placeholder="Family name, first name"
                  pidType="authors"
                  suggesterName="author"
                  extractItemCompletionValue={
                    BasicInfoFields.getSuggestionSourceNameValue
                  }
                  component={SuggesterField}
                />
              </Col>
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.affiliation`}
                  recordFieldPath={`${itemName}.affiliation_record`}
                  placeholder="Affiliation, type for suggestions"
                  pidType="institutions"
                  suggesterName="affiliation"
                  extractItemCompletionValue={
                    BasicInfoFields.getSuggestionSourceLegacyICN
                  }
                  component={SuggesterField}
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
        <Field
          label="Experiment"
          name="experiment"
          recordFieldPath="experiment_record"
          placeholder="Experiment, type for suggestions"
          pidType="experiments"
          suggesterName="experiment"
          extractItemCompletionValue={
            BasicInfoFields.getSuggestionSourceLegacyName
          }
          component={SuggesterField}
        />
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

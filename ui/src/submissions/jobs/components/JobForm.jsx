import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Col, Row } from 'antd';

import TextField from '../../common/components/TextField';
import SelectField from '../../common/components/SelectField';
import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';
import SubmitButton from '../../common/components/SubmitButton';
import { regionOptions } from '../schemas/constants';
import {
  arxivCategoryOptions,
  rankOptions,
} from '../../common/schemas/constants';
import DateField from '../../common/components/DateField';
import RichTextField from '../../common/components/RichTextField';
import StatusFieldContainer from '../containers/StatusFieldContainer';
import { isValidDeadlineDate } from '../schemas/job';

class JobForm extends Component {
  static isInvalidDeadlineDate(date) {
    return !isValidDeadlineDate(date);
  }

  // TODO: move them somewhere common to share with `AuthorForm`
  static getSuggestionSourceLegacyICN(suggestion) {
    return suggestion._source.legacy_ICN;
  }

  static getSuggestionSourceLegacyName(suggestion) {
    return suggestion._source.legacy_name;
  }

  render() {
    const { values, isSubmitting, isValid, isValidating } = this.props;
    return (
      <Form className="bg-white pa3">
        <Field
          name="status"
          label="* Status"
          component={StatusFieldContainer}
        />
        <Field name="title" label="* Title" component={TextField} />
        <Field
          name="external_job_identifier"
          label="Job ID"
          placeholder="Used to reference this job opening, e.g. 07845"
          component={TextField}
        />
        <ArrayOf
          values={values}
          name="institutions"
          label="* Institutions"
          emptyItem={{}}
          renderItem={itemName => (
            <Field
              onlyChild
              name={`${itemName}.value`}
              recordFieldPath={`${itemName}.record`}
              placeholder="Institution, type for suggestions"
              pidType="institutions"
              suggesterName="affiliation"
              extractItemCompletionValue={JobForm.getSuggestionSourceLegacyICN}
              component={SuggesterField}
            />
          )}
        />
        <Field
          name="regions"
          label="* Regions"
          mode="multiple"
          options={regionOptions}
          component={SelectField}
        />
        <Field
          name="field_of_interest"
          label="* Field of Interest"
          mode="multiple"
          options={arxivCategoryOptions}
          component={SelectField}
        />
        <Field
          name="ranks"
          label="* Ranks"
          mode="multiple"
          options={rankOptions}
          component={SelectField}
        />
        <ArrayOf
          values={values}
          name="experiments"
          label="Experiment"
          emptyItem={{}}
          renderItem={itemName => (
            <Field
              onlyChild
              name={`${itemName}.legacy_name`}
              recordFieldPath={`${itemName}.record`}
              placeholder="Experiment, type for suggestions"
              pidType="experiments"
              suggesterName="experiment"
              extractItemCompletionValue={JobForm.getSuggestionSourceLegacyName}
              component={SuggesterField}
            />
          )}
        />
        <Field
          name="url"
          label="URL"
          placeholder="URL for additional information"
          component={TextField}
        />
        <Field
          name="deadline_date"
          label="* Deadline"
          disabledDate={JobForm.isInvalidDeadlineDate}
          component={DateField}
        />
        <ArrayOf
          values={values}
          label="* Contact Details"
          name="contacts"
          emptyItem={{}}
          renderItem={itemName => (
            <Row type="flex" justify="space-between">
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.name`}
                  placeholder="Name"
                  component={TextField}
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
        <ArrayOf
          values={values}
          name="reference_letters"
          label="Reference Letters"
          emptyItem=""
          renderItem={itemName => (
            <Field
              onlyChild
              name={itemName}
              placeholder="URL or email where reference letters should be sent"
              component={TextField}
            />
          )}
        />

        <Field
          name="description"
          label="* Description"
          component={RichTextField}
        />
        <Row type="flex" justify="end">
          <SubmitButton
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            isValid={isValid}
          />
        </Row>
      </Form>
    );
  }
}

JobForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default JobForm;

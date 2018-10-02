import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Button, Col, Row } from 'antd';

import {
  arxivCategoryOptions,
  rankOptions,
  authorStatusOptions,
  degreeTypeOptions,
} from '../schemas/constants';
import CollapsableForm from './CollapsableForm';
import TextField from './TextField';
import BooleanField from './BooleanField';
import SelectField from './SelectField';
import NumberField from './NumberField';
import ArrayOf from './ArrayOf';
import SuggesterField from './SuggesterField';
import TextAreaField from './TextAreaField';
import LabelWithHelp from './LabelWithHelp';

const OPEN_SECTIONS = [
  'personal_info',
  'career_info',
  'personal_websites',
  'comments',
];

class AuthorForm extends Component {
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
    const { values, isSubmitting, isValid, isValidating } = this.props;
    return (
      <Form>
        <CollapsableForm openSections={OPEN_SECTIONS}>
          <CollapsableForm.Section header="Personal Info" key="personal_info">
            <Field
              name="given_name"
              label="* Given Name"
              placeholder="e.g. Diego"
              component={TextField}
            />
            <Field
              name="family_name"
              label="Family Name"
              placeholder="e.g. Martínez Santos"
              component={TextField}
            />
            <Field
              name="display_name"
              label="* Display Name"
              placeholder="How should the author be addressed throughout the site? e.g. Diego Martínez"
              component={TextField}
            />
            <Field
              name="native_name"
              label="Native Name"
              placeholder="For non-Latin names e.g. 麦迪娜 or Эдгар Бугаев"
              component={TextField}
            />
            <ArrayOf
              values={values}
              name="public_emails"
              label="Public Emails"
              emptyItem=""
              renderItem={itemName => (
                <Field
                  onlyChild
                  name={itemName}
                  placeholder="This will be displayed in the INSPIRE Author Profile"
                  component={TextField}
                />
              )}
            />
            <Field
              name="status"
              label="* Status"
              options={authorStatusOptions}
              component={SelectField}
            />
            <Field
              name="orcid"
              addonBefore="orcid.org/"
              label={
                <LabelWithHelp
                  label="ORCID"
                  help="ORCID provides a persistent digital identifier that distinguishes you from other researchers"
                />
              }
              placeholder="0000-0000-0000-0000"
              component={TextField}
            />
          </CollapsableForm.Section>
          <CollapsableForm.Section
            header="Personal Websites"
            key="personal_websites"
          >
            <ArrayOf
              values={values}
              name="websites"
              label="Websites"
              emptyItem=""
              renderItem={itemName => (
                <Field onlyChild name={itemName} component={TextField} />
              )}
            />
            <Field name="blog" label="Blog" component={TextField} />
            <Field
              name="linkedin"
              label="Linkedin"
              addonBefore="linkedin.com/in/"
              component={TextField}
            />
            <Field
              name="twitter"
              label="Twitter"
              addonBefore="twitter.com/"
              component={TextField}
            />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Career Info" key="career_info">
            <Field
              name="arxiv_categories"
              label="Field of Research"
              mode="multiple"
              options={arxivCategoryOptions}
              component={SelectField}
            />
            <ArrayOf
              values={values}
              label="Institution History"
              name="positions"
              emptyItem={{}}
              renderItem={itemName => (
                <Row type="flex" justify="space-between">
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.institution`}
                      placeholder="Institution, type for suggestions"
                      pidType="institutions"
                      suggesterName="affiliation"
                      renderResultItem={AuthorForm.getSuggestionSourceLegacyICN}
                      component={SuggesterField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.rank`}
                      placeholder="Rank"
                      options={rankOptions}
                      component={SelectField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.start_year`}
                      placeholder="Start year"
                      component={NumberField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.end_year`}
                      placeholder="End year"
                      component={NumberField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name="current"
                      suffixText="Current"
                      component={BooleanField}
                    />
                  </Col>
                </Row>
              )}
            />
            <ArrayOf
              values={values}
              label="Experiment History"
              name="project_membership"
              emptyItem={{}}
              renderItem={itemName => (
                <Row type="flex" justify="space-between">
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.name`}
                      placeholder="Experiment, type for suggestions"
                      pidType="experiments"
                      suggesterName="experiment"
                      renderResultItem={
                        AuthorForm.getSuggestionSourceLegacyName
                      }
                      component={SuggesterField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.start_year`}
                      placeholder="Start year"
                      component={NumberField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.end_year`}
                      placeholder="End year"
                      component={NumberField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name="current"
                      suffixText="Current"
                      component={BooleanField}
                    />
                  </Col>
                </Row>
              )}
            />
            <ArrayOf
              values={values}
              label="Advisors"
              name="advisors"
              emptyItem={{}}
              renderItem={itemName => (
                <Row type="flex" justify="space-between">
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.name`}
                      placeholder="Family name, first name"
                      pidType="authors"
                      suggesterName="author"
                      renderResultItem={AuthorForm.getSuggestionSourceNameValue}
                      component={SuggesterField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.degree_type`}
                      placeholder="Degree type"
                      options={degreeTypeOptions}
                      component={SelectField}
                    />
                  </Col>
                </Row>
              )}
            />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Comments" key="comments">
            <Field
              name="comments"
              label="Comments"
              placeholder="any comments you might have"
              rows={4}
              component={TextAreaField}
            />
          </CollapsableForm.Section>
        </CollapsableForm>
        <Row type="flex" justify="end">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || isValidating}
            disabled={!isValid}
          >
            Submit
          </Button>
        </Row>
      </Form>
    );
  }
}

AuthorForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default AuthorForm;

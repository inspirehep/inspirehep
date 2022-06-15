import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Col, Row, Tooltip } from 'antd';

import { authorStatusOptions } from '../schemas/constants';
import {
  degreeTypeOptions,
  arxivCategoryOptions,
  rankOptions,
} from '../../common/schemas/constants';
import CollapsableForm from '../../common/components/CollapsableForm';
import TextField from '../../common/components/TextField';
import BooleanField from '../../common/components/BooleanField';
import SelectField from '../../common/components/SelectField';
import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';
import TextAreaField from '../../common/components/TextAreaField';
import LabelWithHelp from '../../../common/components/LabelWithHelp';
import SubmitButton from '../../common/components/SubmitButton';
import DateField from '../../common/components/DateField';
import AuthorSuggesterField from '../../common/components/AuthorSuggesterField';

const OPEN_SECTIONS = [
  'personal_info',
  'career_info',
  'personal_websites',
  'comments',
];

const HIDDEN_FIELD_HELP =
  'This entry will be hidden from your author profile, but it will still be visible to INSPIRE staff. If this information is incorrect, please inform us using the Comments area in the bottom of the page';
const HiddenFieldLabel = (
  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
  <LabelWithHelp label="Hidden" help={HIDDEN_FIELD_HELP} />
);

function getSuggestionSourceLegacyICN(suggestion: any) {
  return suggestion._source.legacy_ICN;
}

function getSuggestionSourceLegacyName(suggestion: any) {
  return suggestion._source.legacy_name;
}

function AuthorForm({
  values,
  isCatalogerLoggedIn,
  isUpdate
}: any) {
  return (
    <Form>
      {/* @ts-ignore */}
      <CollapsableForm openSections={OPEN_SECTIONS}>
        {/* @ts-ignore */}        
          <CollapsableForm.Section header="Personal Info" key="personal_info">
          <p>
            Email addresses cannot be deleted. If information is incorrect,
            please mark it as `Hidden` and give more details in the Comments
            area.
          </p>
          <Field
            name="given_name"
            label="* Given Names"
            placeholder="e.g. Diego"
            component={TextField}
          />
          <Field
            name="family_name"
            label="* Family Name"
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
          <Field
            name="alternate_name"
            label="Alternate Name"
            placeholder="Names that are searchable but not displayed"
            component={TextField}
          />
          <ArrayOf
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
            values={values}
            name="emails"
            label="Emails"
            emptyItem={{}}
            allowItemDelete={isCatalogerLoggedIn || !isUpdate}
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            renderItem={(itemName: any) => <Row type="flex" justify="space-between">
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.value`}
                  placeholder="Email"
                  component={TextField}
                />
              </Col>
              <Col span={11}>
                <Row gutter={16}>
                  <Col>
                    <Field
                      onlyChild
                      name={`${itemName}.current`}
                      suffixText="Current"
                      component={BooleanField}
                    />
                  </Col>
                  <Col>
                    <Field
                      onlyChild
                      name={`${itemName}.hidden`}
                      suffixText={
                        <LabelWithHelp
                          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                          label="Hidden"
                          help="Hidden emails will not be displayed, but will only be used by INSPIRE staff for contact and identification purposes."
                        />
                      }
                      component={BooleanField}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>}
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
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                label={
                  <Tooltip title="ORCID provides a persistent digital identifier that distinguishes you from other researchers">
                    ORCID
                  </Tooltip>
                }
                help="ORCID provides a persistent digital identifier that distinguishes you from other researchers"
              />
            }
            placeholder="0000-0000-0000-0000"
            component={TextField}
          />
          {/* @ts-ignore */}
        </CollapsableForm.Section>
        {/* @ts-ignore */}
        <CollapsableForm.Section
          header="Author websites"
          key="personal_websites"
        >
          <ArrayOf
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
            values={values}
            name="websites"
            label="Websites"
            emptyItem=""
            renderItem={(itemName: any) => <Field onlyChild name={itemName} component={TextField} />}
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

        {/* @ts-ignore */}
        </CollapsableForm.Section>
        {/* @ts-ignore */}
        <CollapsableForm.Section header="Career Info" key="career_info">
          <p>
            Career information cannot be deleted. If information is incorrect,
            please mark it as ‘Hidden’ and give more details in the Comments
            area.
          </p>
          <Field
            name="arxiv_categories"
            label="Field of Research"
            mode="multiple"
            options={arxivCategoryOptions}
            component={SelectField}
          />
          <ArrayOf
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; label: string; name: string; ... Remove this comment to see the full error message
            values={values}
            label="Institution History"
            name="positions"
            emptyItem={{}}
            allowItemDelete={isCatalogerLoggedIn || !isUpdate}
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            renderItem={(itemName: any) => <Row type="flex" justify="space-between">
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.institution`}
                  recordFieldPath={`${itemName}.record`}
                  placeholder="Institution, type for suggestions"
                  pidType="institutions"
                  suggesterName="affiliation"
                  searchAsYouType
                  extractItemCompletionValue={getSuggestionSourceLegacyICN}
                  component={SuggesterField}
                />
              </Col>
              <Col span={11}>
                <Row gutter={16}>
                  <Col>
                    <Field
                      onlyChild
                      name={`${itemName}.current`}
                      suffixText="Current"
                      component={BooleanField}
                    />
                  </Col>
                  {isUpdate && (
                    <Col>
                      <Field
                        onlyChild
                        name={`${itemName}.hidden`}
                        suffixText={HiddenFieldLabel}
                        component={BooleanField}
                      />
                    </Col>
                  )}
                </Row>
              </Col>
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.start_date`}
                  placeholder="Start year"
                  component={DateField}
                  picker="year"
                />
              </Col>
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.end_date`}
                  placeholder="End year"
                  component={DateField}
                  picker="year"
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
            </Row>}
          />
          <ArrayOf
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; label: string; name: string; ... Remove this comment to see the full error message
            values={values}
            label="Experiment History"
            name="project_membership"
            allowItemDelete={isCatalogerLoggedIn || !isUpdate}
            emptyItem={{}}
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            renderItem={(itemName: any) => <Row type="flex" justify="space-between">
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.name`}
                  recordFieldPath={`${itemName}.record`}
                  placeholder="Experiment, type for suggestions"
                  pidType="experiments"
                  suggesterName="experiment"
                  searchAsYouType
                  extractItemCompletionValue={getSuggestionSourceLegacyName}
                  component={SuggesterField}
                />
              </Col>
              <Col span={11}>
                <Row gutter={16}>
                  <Col>
                    <Field
                      onlyChild
                      name={`${itemName}.current`}
                      suffixText="Current"
                      component={BooleanField}
                    />
                  </Col>
                  {isUpdate && (
                    <Col>
                      <Field
                        onlyChild
                        name={`${itemName}.hidden`}
                        suffixText={HiddenFieldLabel}
                        component={BooleanField}
                      />
                    </Col>
                  )}
                </Row>
              </Col>
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.start_date`}
                  placeholder="Start year"
                  component={DateField}
                  picker="year"
                />
              </Col>
              <Col span={11}>
                <Field
                  onlyChild
                  name={`${itemName}.end_date`}
                  placeholder="End year"
                  component={DateField}
                  picker="year"
                />
              </Col>
            </Row>}
          />
          <ArrayOf
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; label: string; name: string; ... Remove this comment to see the full error message
            values={values}
            label="Advisors"
            name="advisors"
            allowItemDelete={isCatalogerLoggedIn || !isUpdate}
            emptyItem={{}}
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            renderItem={(itemName: any) => <Row type="flex" justify="space-between">
              <Col span={11}>
                <AuthorSuggesterField
                  onlyChild
                  name={`${itemName}.name`}
                  recordFieldPath={`${itemName}.record`}
                  placeholder="Family name, first name"
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
              {isUpdate && (
                <Col span={11}>
                  <Field
                    onlyChild
                    name={`${itemName}.hidden`}
                    suffixText={HiddenFieldLabel}
                    component={BooleanField}
                  />
                </Col>
              )}
            </Row>}
          />
          {/* @ts-ignore */}
        </CollapsableForm.Section>
        {/* @ts-ignore */}
        <CollapsableForm.Section
          header="Comments to the INSPIRE team"
          key="comments"
        >
          <Field
            name="comments"
            label="Comments"
            placeholder="any comments you might have"
            rows={4}
            component={TextAreaField}
          />
          {/* @ts-ignore */}
        </CollapsableForm.Section>
      </CollapsableForm>
      <Row justify="end">
        <SubmitButton />
      </Row>
    </Form>
  );
}

AuthorForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
  isCatalogerLoggedIn: PropTypes.bool,
  isUpdate: PropTypes.bool,
};

export default AuthorForm;

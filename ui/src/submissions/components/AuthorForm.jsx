import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Button, Col, Row } from 'antd';

import CollapsableForm from './CollapsableForm';
import TextField from './TextField';
import BooleanField from './BooleanField';
import SelectField from './SelectField';
import NumberField from './NumberField';
import ArrayOf from './ArrayOf';
import { fieldOfResearchOptions, rankOptions } from '../schemas/constants';
import SuggesterField from './SuggesterField';
import TextAreaField from './TextAreaField';

class AuthorForm extends Component {
  render() {
    const { values, isSubmitting, isValid, isValidating } = this.props;
    return (
      <Form>
        <CollapsableForm openSections={['personal_info', 'comments']}>
          <CollapsableForm.Section header="Personal Info" key="personal_info">
            <Field
              name="display_name"
              label="Display Name"
              component={TextField}
            />
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
              name="websites"
              label="Websites"
              emptyItem=""
              renderItem={itemName => (
                <Field
                  onlyChild
                  // wrapperCol={{ span: 24 }}
                  name={itemName}
                  placeholder="website"
                  component={TextField}
                />
              )}
            />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Career Info" key="career_info">
            <ArrayOf
              values={values}
              label="Institution History"
              name="institution_history"
              renderItem={itemName => (
                <Row type="flex" justify="space-between">
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.institution`}
                      placeholder="institution"
                      pidType="institutions"
                      suggesterName="affiliation"
                      component={SuggesterField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.rank`}
                      placeholder="rank"
                      options={rankOptions}
                      component={SelectField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.start_year`}
                      placeholder="start year"
                      component={NumberField}
                    />
                  </Col>
                  <Col span={11}>
                    <Field
                      onlyChild
                      name={`${itemName}.end_year`}
                      placeholder="end year"
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

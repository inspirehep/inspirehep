import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Col, Row } from 'antd';

import TextField from '../../common/components/TextField';
import SelectField from '../../common/components/SelectField';
import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';
import SubmitButton from '../../common/components/SubmitButton';
import { inspireCategoryOptions } from '../../common/schemas/constants';
import RichTextField from '../../common/components/RichTextField';
import NumberField from '../../common/components/NumberField';
import { countryOptions } from '../schemas/constants';
import DateRangeField from '../../common/components/DateRangeField';
import ConferencesExistOnDatesAlert from './ConferencesExistOnDatesAlert';

// TODO: move them somewhere common to share with `AuthorForm`
function getSuggestionSourceNameValue(suggestion) {
  return suggestion._source.name.value;
}

function ConferenceForm({ values, isSubmitting, isValid, isValidating }) {
  return (
    <Form className="bg-white pa3">
      <Field name="name" label="* Conference Name" component={TextField} />
      <Field name="subtitle" label="Subtitle" component={TextField} />
      <ArrayOf
        values={values}
        name="acronyms"
        label="Acronym(s)"
        emptyItem=""
        renderItem={itemName => (
          <Field onlyChild name={itemName} component={TextField} />
        )}
      />
      <Field
        name="series_name"
        label="Series Name"
        placeholder="Series name, type for suggestions"
        pidType="conferences"
        suggesterName="series_name"
        component={SuggesterField}
      />
      <Field
        name="series_number"
        label="Series Number"
        component={NumberField}
      />
      {values.dates && <ConferencesExistOnDatesAlert dates={values.dates} />}
      <Field name="dates" label="* Dates" component={DateRangeField} />
      <ArrayOf
        values={values}
        name="addresses"
        label="* Address(es)"
        emptyItem={{}}
        renderItem={itemName => (
          <Row type="flex" justify="space-between">
            <Col span={11}>
              <Field
                onlyChild
                name={`${itemName}.city`}
                placeholder="* City"
                component={TextField}
              />
            </Col>
            <Col span={11}>
              <Field
                onlyChild
                name={`${itemName}.country`}
                placeholder="* Country"
                options={countryOptions}
                component={SelectField}
              />
            </Col>
            <Col span={11}>
              <Field
                onlyChild
                name={`${itemName}.state`}
                placeholder="State"
                component={TextField}
              />
            </Col>
            <Col span={11}>
              <Field
                onlyChild
                name={`${itemName}.venue`}
                placeholder="Venue"
                component={TextField}
              />
            </Col>
          </Row>
        )}
      />
      <Field
        name="field_of_interest"
        label="* Field of Interest"
        mode="multiple"
        options={inspireCategoryOptions}
        component={SelectField}
      />
      <ArrayOf
        values={values}
        name="websites"
        label="Conference Website(s)"
        emptyItem=""
        renderItem={itemName => (
          <Field onlyChild name={itemName} component={TextField} />
        )}
      />
      <ArrayOf
        // TODO: is it worth to move this and its schema to common since it's used in jobs
        values={values}
        label="Contact Detail(s)"
        name="contacts"
        emptyItem={{}}
        renderItem={itemName => (
          <Row type="flex" justify="space-between">
            <Col span={11}>
              <Field
                onlyChild
                recordFieldPath={`${itemName}.record`}
                name={`${itemName}.name`}
                placeholder="Name"
                pidType="authors"
                suggesterName="author"
                extractItemCompletionValue={getSuggestionSourceNameValue}
                component={SuggesterField}
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
      <Field name="description" label="Description" component={RichTextField} />
      <Field
        name="additional_info"
        label="Additional Information"
        component={TextField}
      />
      <ArrayOf
        values={values}
        name="keywords"
        label="Keywords"
        emptyItem=""
        renderItem={itemName => (
          <Field onlyChild name={itemName} component={TextField} />
        )}
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

ConferenceForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ConferenceForm;

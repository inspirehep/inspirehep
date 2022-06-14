import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Col, Row } from 'antd';

import TextField from '../../common/components/TextField';
import SelectField from '../../common/components/SelectField';
import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';
import SubmitButton from '../../common/components/SubmitButton';
import {
  inspireCategoryOptions,
  countryOptions,
} from '../../common/schemas/constants';
import RichTextField from '../../common/components/RichTextField';
import NumberField from '../../common/components/NumberField';
import DateRangeField from '../../common/components/DateRangeField';
import ExistingConferencesAlertContainer from '../containers/ExistingConferencesAlertContainer';
import ContactsField from '../../common/components/ContactsField';

function ConferenceForm({
  values
}: any) {
  return (
    <Form className="bg-white pa3">
      <Field name="name" label="* Conference Name" component={TextField} />
      <Field name="subtitle" label="Subtitle" component={TextField} />
      <ArrayOf
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
        values={values}
        name="acronyms"
        label="Acronym(s)"
        emptyItem=""
        renderItem={(itemName: any) => <Field onlyChild name={itemName} component={TextField} />}
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
      {values.dates && (
        <ExistingConferencesAlertContainer dates={values.dates} />
      )}
      <Field name="dates" label="* Dates" component={DateRangeField} />
      <ArrayOf
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
        values={values}
        name="addresses"
        label="* Address(es)"
        emptyItem={{}}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        renderItem={(itemName: any) => <Row type="flex" justify="space-between">
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
              placeholder="* Country/Region"
              showSearch
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
        </Row>}
      />
      <Field
        name="field_of_interest"
        label="* Field of Interest"
        mode="multiple"
        options={inspireCategoryOptions}
        component={SelectField}
      />
      <ArrayOf
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
        values={values}
        name="websites"
        label="Conference Website(s)"
        emptyItem=""
        renderItem={(itemName: any) => <Field onlyChild name={itemName} component={TextField} />}
      />
      <ContactsField />
      <Field name="description" label="Description" component={RichTextField} />
      <Field
        name="additional_info"
        label="Additional Information"
        component={TextField}
      />
      <ArrayOf
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
        values={values}
        name="keywords"
        label="Keywords"
        emptyItem=""
        renderItem={(itemName: any) => <Field onlyChild name={itemName} component={TextField} />}
      />
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Row type="flex" justify="end">
        <SubmitButton />
      </Row>
    </Form>
  );
}

ConferenceForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ConferenceForm;

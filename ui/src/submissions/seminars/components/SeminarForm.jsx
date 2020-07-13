import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Col, Row, Form as AntForm } from 'antd';

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
import ContactsField from '../../common/components/ContactsField';
import { timeZoneOptions, SEMINAR_DATETIME_FORMAT } from '../schemas/constants';
import { LABEL_COL, WRAPPER_COL } from '../../common/withFormItem';
import { SEMINARS_PID_TYPE, TIME_FORMAT } from '../../../common/constants';
import AuthorSuggesterField from '../../common/components/AuthorSuggesterField';
import BooleanField from '../../common/components/BooleanField';
import LabelWithHelp from '../../../common/components/LabelWithHelp';

function getSuggestionSourceLegacyICN(suggestion) {
  return suggestion._source.legacy_ICN;
}

const TIME_PICKER_OPTIONS = {
  format: TIME_FORMAT,
  minuteStep: 5,
};

function SeminarForm({ values }) {
  return (
    <Form className="bg-white pa3">
      <Field name="name" label="* Seminar Title" component={TextField} />
      <Field
        name="dates"
        label="* Dates"
        component={DateRangeField}
        showTime={TIME_PICKER_OPTIONS}
        format={SEMINAR_DATETIME_FORMAT}
      />
      <Field
        name="timezone"
        label="Timezone"
        showSearch
        virtualScroll
        options={timeZoneOptions}
        component={SelectField}
      />
      <ArrayOf
        values={values}
        name="speakers"
        label="* Speaker(s)"
        emptyItem={{}}
        renderItem={itemName => (
          <Row type="flex" justify="space-between">
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
                name={`${itemName}.affiliation`}
                recordFieldPath={`${itemName}.affiliation_record`}
                placeholder="Affiliation, type for suggestions"
                pidType="institutions"
                suggesterName="affiliation"
                extractItemCompletionValue={getSuggestionSourceLegacyICN}
                component={SuggesterField}
              />
            </Col>
          </Row>
        )}
      />
      <Field
        name="series_name"
        label="Series Name"
        placeholder="Series name, type for suggestions"
        pidType={SEMINARS_PID_TYPE}
        suggesterName="series_name"
        component={SuggesterField}
      />
      <Field
        name="series_number"
        label="Series Number"
        component={NumberField}
      />
      <ArrayOf
        values={values}
        name="websites"
        label="Seminar Website(s)"
        emptyItem=""
        renderItem={itemName => (
          <Field onlyChild name={itemName} component={TextField} />
        )}
      />
      <ArrayOf
        values={values}
        name="material_urls"
        label="Material(s)"
        emptyItem={{}}
        renderItem={itemName => (
          <Row type="flex" justify="space-between">
            <Col span={11}>
              <Field
                onlyChild
                name={`${itemName}.value`}
                placeholder="https://drive.google.com/slides"
                component={TextField}
              />
            </Col>
            <Col span={11}>
              <Field
                onlyChild
                name={`${itemName}.description`}
                placeholder="Description, eg. Slides, PDF"
                component={TextField}
              />
            </Col>
          </Row>
        )}
      />
      <ArrayOf
        values={values}
        name="join_urls"
        label="Join URL(s)"
        emptyItem={{}}
        renderItem={itemName => (
          <Row type="flex" justify="space-between">
            <Col span={11}>
              <Field
                onlyChild
                name={`${itemName}.value`}
                placeholder="https://zoom.us/videoconference"
                component={TextField}
              />
            </Col>
            <Col span={11}>
              <Field
                onlyChild
                name={`${itemName}.description`}
                placeholder="Description, eg. Zoom"
                component={TextField}
              />
            </Col>
          </Row>
        )}
      />
      <Field name="captioned" label="Has captions" component={BooleanField} />
      <AntForm.Item
        label="Address"
        labelCol={LABEL_COL}
        wrapperCol={WRAPPER_COL}
      >
        <Row type="flex" justify="space-between">
          <Col span={11}>
            <Field
              onlyChild
              name="address.city"
              placeholder="City"
              component={TextField}
            />
          </Col>
          <Col span={11}>
            <Field
              onlyChild
              name="address.country"
              placeholder="Country/Region"
              showSearch
              options={countryOptions}
              component={SelectField}
            />
          </Col>
          <Col span={11}>
            <Field
              onlyChild
              name="address.state"
              placeholder="State"
              component={TextField}
            />
          </Col>
          <Col span={11}>
            <Field
              onlyChild
              name="address.venue"
              placeholder="Venue"
              component={TextField}
            />
          </Col>
        </Row>
      </AntForm.Item>
      <Field
        name="field_of_interest"
        label="* Field of Interest"
        mode="multiple"
        options={inspireCategoryOptions}
        component={SelectField}
      />
      <ContactsField />
      <ArrayOf
        values={values}
        name="literature_records"
        label={
          <LabelWithHelp
            label="Related paper(s)"
            help="If the seminar refers to an INSPIRE paper, please fill in the link."
          />
        }
        emptyItem=""
        renderItem={itemName => (
          <Field
            onlyChild
            addonBefore="inspirehep.net/literature/"
            name={itemName}
            component={TextField}
          />
        )}
      />
      <Field name="abstract" label="Abstract" component={RichTextField} />
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
        <SubmitButton />
      </Row>
    </Form>
  );
}

SeminarForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default SeminarForm;

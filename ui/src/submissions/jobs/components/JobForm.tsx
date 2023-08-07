import React from 'react';
import { Field, Form } from 'formik';
import { Row } from 'antd';

import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import TextField from '../../common/components/TextField';
import SelectField from '../../common/components/SelectField';
import ArrayOf from '../../common/components/ArrayOf';
import SuggesterField from '../../common/components/SuggesterField';
import SubmitButton from '../../common/components/SubmitButton';
import { regionOptions, fieldOfInterestOptions } from '../schemas/constants';
import { rankOptions } from '../../common/schemas/constants';
import DateField from '../../common/components/DateField';
import RichTextField from '../../common/components/RichTextField';
import StatusFieldContainer from '../containers/StatusFieldContainer';
import { isValidDeadlineDate } from '../schemas/job';
import FieldInfoAlert from '../../common/components/FieldInfoAlert';
import { POST_DOC_RANK_VALUE } from '../../../common/constants';
import ContactsField from '../../common/components/ContactsField';
import { Suggestion } from '../../../types';

function JobForm({ values }: { values: any }) {
  function isInvalidDeadlineDate(date: Date) {
    return !isValidDeadlineDate(date);
  }

  function getSuggestionSourceLegacyICN(suggestion: Suggestion) {
    return suggestion._source.legacy_ICN;
  }

  function getSuggestionSourceLegacyName(suggestion: Suggestion) {
    return suggestion._source.legacy_name;
  }

  function isPostDocSubmission() {
    return (
      values.ranks &&
      values.ranks.some((rank: string) => rank === POST_DOC_RANK_VALUE)
    );
  }

  return (
    <Form className="bg-white pa3">
      <Field name="status" label="* Status" component={StatusFieldContainer} />
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
        renderItem={(itemName: { record: number }) => (
          <Field
            onlyChild
            name={`${itemName}.value`}
            recordFieldPath={`${itemName}.record`}
            placeholder="Institution, type for suggestions"
            pidType="institutions"
            suggesterName="affiliation"
            searchasyoutype="true"
            extractItemCompletionValue={getSuggestionSourceLegacyICN}
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
        options={fieldOfInterestOptions}
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
        renderItem={(itemName: { record: number }) => (
          <Field
            onlyChild
            name={`${itemName}.legacy_name`}
            recordFieldPath={`${itemName}.record`}
            placeholder="Experiment, type for suggestions"
            pidType="experiments"
            suggesterName="experiment"
            searchasyoutype="true"
            extractItemCompletionValue={getSuggestionSourceLegacyName}
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
      {isPostDocSubmission() && (
        <FieldInfoAlert
          description={
            <span>
              Many institutions have agreed to set January 7 as the earliest
              deadline which can be imposed for accepting offers of postdoctoral
              positions.{' '}
              <LinkWithTargetBlank href="http://insti.physics.sunysb.edu/itp/postdoc-agreement.html">
                Learn More
              </LinkWithTargetBlank>
            </span>
          }
        />
      )}
      <Field
        name="deadline_date"
        label="* Deadline"
        disabledDate={isInvalidDeadlineDate}
        component={DateField}
      />
      <ContactsField label="* Contact Details" />
      <ArrayOf
        values={values}
        name="reference_letters"
        label="Reference Letters"
        emptyItem=""
        renderItem={(itemName: { record: number }) => (
          <Field
            onlyChild
            name={itemName}
            placeholder="URL (http://) or email where reference letters should be sent"
            component={TextField}
          />
        )}
      />

      <Field
        name="description"
        label="* Description"
        component={RichTextField}
      />
      <Row justify="end">
        <SubmitButton />
      </Row>
    </Form>
  );
}

export default JobForm;

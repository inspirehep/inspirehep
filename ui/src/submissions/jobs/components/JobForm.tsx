import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import { Row } from 'antd';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../../common/components/ExternalLink.tsx';
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

class JobForm extends Component {
  static isInvalidDeadlineDate(date: any) {
    return !isValidDeadlineDate(date);
  }

  // TODO: move them somewhere common to share with `AuthorForm`
  static getSuggestionSourceLegacyICN(suggestion: any) {
    return suggestion._source.legacy_ICN;
  }

  static getSuggestionSourceLegacyName(suggestion: any) {
    return suggestion._source.legacy_name;
  }

  isPostDocSubmission() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values } = this.props;

    return values.ranks && values.ranks.some((rank: any) => rank === POST_DOC_RANK_VALUE);
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values } = this.props;
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
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
          values={values}
          name="institutions"
          label="* Institutions"
          emptyItem={{}}
          renderItem={(itemName: any) => <Field
            onlyChild
            name={`${itemName}.value`}
            recordFieldPath={`${itemName}.record`}
            placeholder="Institution, type for suggestions"
            pidType="institutions"
            suggesterName="affiliation"
            searchAsYouType
            extractItemCompletionValue={JobForm.getSuggestionSourceLegacyICN}
            component={SuggesterField}
          />}
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
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
          values={values}
          name="experiments"
          label="Experiment"
          emptyItem={{}}
          renderItem={(itemName: any) => <Field
            onlyChild
            name={`${itemName}.legacy_name`}
            recordFieldPath={`${itemName}.record`}
            placeholder="Experiment, type for suggestions"
            pidType="experiments"
            suggesterName="experiment"
            searchAsYouType
            extractItemCompletionValue={JobForm.getSuggestionSourceLegacyName}
            component={SuggesterField}
          />}
        />
        <Field
          name="url"
          label="URL"
          placeholder="URL for additional information"
          component={TextField}
        />
        {this.isPostDocSubmission() && (
          <FieldInfoAlert
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            description={
              <span>
                Many institutions have agreed to set January 7 as the earliest
                deadline which can be imposed for accepting offers of
                postdoctoral positions.{' '}
                <ExternalLink href="http://insti.physics.sunysb.edu/itp/postdoc-agreement.html">
                  Learn More
                </ExternalLink>
              </span>
            }
          />
        )}
        <Field
          name="deadline_date"
          label="* Deadline"
          disabledDate={JobForm.isInvalidDeadlineDate}
          component={DateField}
        />
        <ContactsField label="* Contact Details" />
        <ArrayOf
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ values: any; name: string; label: string; ... Remove this comment to see the full error message
          values={values}
          name="reference_letters"
          label="Reference Letters"
          emptyItem=""
          renderItem={(itemName: any) => <Field
            onlyChild
            name={itemName}
            placeholder="URL (http://) or email where reference letters should be sent"
            component={TextField}
          />}
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
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
JobForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default JobForm;

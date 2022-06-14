import React, { Component } from 'react';
import { Form, Field } from 'formik';
import { Row } from 'antd';
import PropTypes from 'prop-types';

import CollapsableForm from '../../common/components/CollapsableForm';
import BasicInfoFields from './BasicInfoFields';
import SubmitButton from '../../common/components/SubmitButton';
import LinkFields from './LinkFields';
import ReferencesField from './ReferencesField';
import CommentsField from './CommentsField';
import TextField from '../../common/components/TextField';
import TextAreaField from '../../common/components/TextAreaField';
import SuggesterField from '../../common/components/SuggesterField';
import ConferenceSuggestion from './ConferenceSuggestion';
import JournalSuggestion from './JournalSuggestion';
import NumberField from '../../common/components/NumberField';

const OPEN_SECTIONS = ['basic_info', 'links', 'publication_info'];

class ArticleForm extends Component {
  static getSuggestionSourceShortTitle(suggestion: any) {
    return suggestion._source.short_title;
  }

  static renderJournalSuggestion(suggestion: any) {
    const journal = suggestion._source;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return <JournalSuggestion journal={journal} />;
  }

  static getSuggestionSourceFirstTitle(suggestion: any) {
    return suggestion._source.titles[0].title;
  }

  static renderConferenceSuggestion(suggestion: any) {
    const conference = suggestion._source;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return <ConferenceSuggestion conference={conference} />;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values } = this.props;
    return (
      <Form>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <CollapsableForm openSections={OPEN_SECTIONS}>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="Links" key="links">
            <LinkFields />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="Basic Info" key="basic_info">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <BasicInfoFields values={values} withCollaborationField />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section
            header="Publication Info"
            key="publication_info"
          >
            <Field
              name="journal_title"
              recordFieldPath="journal_record"
              label="Journal Title"
              pidType="journals"
              suggesterName="journal_title"
              extractItemCompletionValue={
                ArticleForm.getSuggestionSourceShortTitle
              }
              renderResultItem={ArticleForm.renderJournalSuggestion}
              component={SuggesterField}
            />
            <Field name="volume" label="Volume" component={TextField} />
            <Field name="issue" label="Issue" component={TextField} />
            <Field name="year" label="Year" component={NumberField} />
            <Field
              name="page_range"
              label="Page Range/Article ID"
              placeholder="e.g. 1-100"
              component={TextField}
            />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section
            header="Conference Info"
            key="conference_info"
          >
            <Field
              name="conference_info"
              recordFieldPath="conference_record"
              label="Conference Info"
              placeholder="Conference name, acronym, place, date, type for suggestions"
              pidType="conferences"
              suggesterName="conference"
              extractItemCompletionValue={
                ArticleForm.getSuggestionSourceFirstTitle
              }
              renderResultItem={ArticleForm.renderConferenceSuggestion}
              component={SuggesterField}
            />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section
            header="Proceedings Info (if not published in a journal)"
            key="proceedings_info"
          >
            <Field
              name="proceedings_info"
              label="Proceedings"
              placeholder="Editors, title of proceedings, publisher, year of publication, page range, URL"
              rows={6}
              component={TextAreaField}
            />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="References" key="references">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <ReferencesField values={values} />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section header="Comments" key="comments">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <CommentsField values={values} />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
        </CollapsableForm>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Row type="flex" justify="end">
          <SubmitButton />
        </Row>
      </Form>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ArticleForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ArticleForm;

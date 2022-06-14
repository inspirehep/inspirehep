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
  static getSuggestionSourceShortTitle(suggestion) {
    return suggestion._source.short_title;
  }

  static renderJournalSuggestion(suggestion) {
    const journal = suggestion._source;
    return <JournalSuggestion journal={journal} />;
  }

  static getSuggestionSourceFirstTitle(suggestion) {
    return suggestion._source.titles[0].title;
  }

  static renderConferenceSuggestion(suggestion) {
    const conference = suggestion._source;
    return <ConferenceSuggestion conference={conference} />;
  }

  render() {
    const { values } = this.props;
    return (
      <Form>
        <CollapsableForm openSections={OPEN_SECTIONS}>
          <CollapsableForm.Section header="Links" key="links">
            <LinkFields />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Basic Info" key="basic_info">
            <BasicInfoFields values={values} withCollaborationField />
          </CollapsableForm.Section>
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
          </CollapsableForm.Section>
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
          </CollapsableForm.Section>
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
          </CollapsableForm.Section>
          <CollapsableForm.Section header="References" key="references">
            <ReferencesField values={values} />
          </CollapsableForm.Section>
          <CollapsableForm.Section header="Comments" key="comments">
            <CommentsField values={values} />
          </CollapsableForm.Section>
        </CollapsableForm>
        <Row type="flex" justify="end">
          <SubmitButton />
        </Row>
      </Form>
    );
  }
}

ArticleForm.propTypes = {
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ArticleForm;

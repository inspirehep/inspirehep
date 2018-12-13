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

const OPEN_SECTIONS = ['basic_info', 'links', 'publication_info'];

class ArticleForm extends Component {
  static getSuggestionSourceShortTitle(suggestion) {
    return suggestion._source.short_title;
  }

  static renderJournalSuggestion(suggestion) {
    const shortTitle = ArticleForm.getSuggestionSourceShortTitle(suggestion);
    const journal = suggestion._source;
    const journalTitle = journal.journal_title && journal.journal_title.title;
    return (
      <>
        <div>
          <strong>{shortTitle}</strong>
        </div>
        <div className="f7">
          <span>{journalTitle}</span>
        </div>
      </>
    );
  }

  static getSuggestionSourceFirstTitle(suggestion) {
    return suggestion._source.titles[0].title;
  }

  static renderConferenceSuggestion(suggestion) {
    const title = ArticleForm.getSuggestionSourceFirstTitle(suggestion);
    const conference = suggestion._source;
    const { cnum, acronyms, address } = conference;
    const openingDate = conference.opening_date;
    const firstAcronym = acronyms && acronyms[0];
    const firstAddress = (address && address[0]) || {};
    const countryCode = firstAddress.country_code;
    const city = firstAddress.cities && firstAddress.cities[0];
    return (
      <>
        <div>
          <strong>{title}</strong>
        </div>
        <div className="f7">
          <div>{firstAcronym && <span>({firstAcronym})</span>}</div>
          <div>
            <span>{openingDate} </span>
            <span>
              {city}, {countryCode}
            </span>
          </div>
          <div>
            <span>{cnum}</span>
          </div>
        </div>
      </>
    );
  }

  render() {
    const { values, isSubmitting, isValid, isValidating } = this.props;
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
            <Field name="year" label="Year" component={TextField} />
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
          <SubmitButton
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            isValid={isValid}
          />
        </Row>
      </Form>
    );
  }
}

ArticleForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default ArticleForm;

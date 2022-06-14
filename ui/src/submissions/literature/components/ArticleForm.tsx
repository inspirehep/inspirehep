import React, { Component } from 'react';
import { Form, Field } from 'formik';
import { Row } from 'antd';

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

type Props = {
    values: {
        [key: string]: $TSFixMe;
    };
};

class ArticleForm extends Component<Props> {

  static getSuggestionSourceShortTitle(suggestion: $TSFixMe) {
    return suggestion._source.short_title;
  }

  static renderJournalSuggestion(suggestion: $TSFixMe) {
    const journal = suggestion._source;
    return <JournalSuggestion journal={journal} />;
  }

  static getSuggestionSourceFirstTitle(suggestion: $TSFixMe) {
    return suggestion._source.titles[0].title;
  }

  static renderConferenceSuggestion(suggestion: $TSFixMe) {
    const conference = suggestion._source;
    return <ConferenceSuggestion conference={conference} />;
  }

  render() {
    const { values } = this.props;
    // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
    return (<Form>
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <CollapsableForm openSections={OPEN_SECTIONS}>
          <(CollapsableForm as $TSFixMe).Section header="Links" key="links">
            <LinkFields />
          </(CollapsableForm as $TSFixMe).Section>
          <(CollapsableForm as $TSFixMe).Section header="Basic Info" key="basic_info">
            <BasicInfoFields values={values} withCollaborationField/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="Publication Info" key="publication_info">
            <Field name="journal_title" recordFieldPath="journal_record" label="Journal Title" pidType="journals" suggesterName="journal_title" extractItemCompletionValue={ArticleForm.getSuggestionSourceShortTitle} renderResultItem={ArticleForm.renderJournalSuggestion} component={SuggesterField}/>
            <Field name="volume" label="Volume" component={TextField}/>
            <Field name="issue" label="Issue" component={TextField}/>
            <Field name="year" label="Year" component={NumberField}/>
            <Field name="page_range" label="Page Range/Article ID" placeholder="e.g. 1-100" component={TextField}/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="Conference Info" key="conference_info">
            <Field name="conference_info" recordFieldPath="conference_record" label="Conference Info" placeholder="Conference name, acronym, place, date, type for suggestions" pidType="conferences" suggesterName="conference" extractItemCompletionValue={ArticleForm.getSuggestionSourceFirstTitle} renderResultItem={ArticleForm.renderConferenceSuggestion} component={SuggesterField}/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="Proceedings Info (if not published in a journal)" key="proceedings_info">
            <Field name="proceedings_info" label="Proceedings" placeholder="Editors, title of proceedings, publisher, year of publication, page range, URL" rows={6} component={TextAreaField}/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="References" key="references">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <ReferencesField values={values}/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="Comments" key="comments">
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <CommentsField values={values}/>
          </(CollapsableForm as $TSFixMe).Section>
        // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'typeof Co... Remove this comment to see the full error message
        </CollapsableForm>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Row type="flex" justify="end">
          <SubmitButton />
        </Row>
      </Form>);
  }
}

export default ArticleForm;

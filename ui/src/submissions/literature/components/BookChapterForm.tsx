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
import SuggesterField from '../../common/components/SuggesterField';
import BookSuggestion from './BookSuggestion';

const OPEN_SECTIONS = ['basic_info', 'links', 'publication_info'];

type Props = {
    isSubmitting: boolean;
    isValidating: boolean;
    isValid: boolean;
    values: {
        [key: string]: $TSFixMe;
    };
};

class BookChapterForm extends Component<Props> {

  static getSuggestionSourceFirstTitle(suggestion: $TSFixMe) {
    return suggestion._source.titles[0].title;
  }

  static renderBookSuggestion(suggestion: $TSFixMe) {
    const book = suggestion._source;
    return <BookSuggestion book={book} />;
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
            <BasicInfoFields values={values}/>
          </(CollapsableForm as $TSFixMe).Section>
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'header'. Did you mean 'Headers'?
          <(CollapsableForm as $TSFixMe).Section header="Publication Info" key="publication_info">
            <Field name="book_title" recordFieldPath="parent_book_record" label="Book Title" pidType="literature" suggesterName="book_title" extractItemCompletionValue={BookChapterForm.getSuggestionSourceFirstTitle} renderResultItem={BookChapterForm.renderBookSuggestion} component={SuggesterField}/>
            <Field name="start_page" label="Start Page" component={TextField}/>
            <Field name="end_page" label="End Page" component={TextField}/>
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

export default BookChapterForm;

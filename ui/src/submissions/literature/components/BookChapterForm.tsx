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
import SuggesterField from '../../common/components/SuggesterField';
import BookSuggestion from './BookSuggestion';

const OPEN_SECTIONS = ['basic_info', 'links', 'publication_info'];

class BookChapterForm extends Component {
  static getSuggestionSourceFirstTitle(suggestion: any) {
    return suggestion._source.titles[0].title;
  }

  static renderBookSuggestion(suggestion: any) {
    const book = suggestion._source;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return <BookSuggestion book={book} />;
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
            <BasicInfoFields values={values} />
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          </CollapsableForm.Section>
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
          <CollapsableForm.Section
            header="Publication Info"
            key="publication_info"
          >
            <Field
              name="book_title"
              recordFieldPath="parent_book_record"
              label="Book Title"
              pidType="literature"
              suggesterName="book_title"
              extractItemCompletionValue={
                BookChapterForm.getSuggestionSourceFirstTitle
              }
              renderResultItem={BookChapterForm.renderBookSuggestion}
              component={SuggesterField}
            />
            <Field name="start_page" label="Start Page" component={TextField} />
            <Field name="end_page" label="End Page" component={TextField} />
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
BookChapterForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default BookChapterForm;

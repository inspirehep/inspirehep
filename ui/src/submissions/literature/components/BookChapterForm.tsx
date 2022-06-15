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
    /* @ts-ignore */
    return <BookSuggestion book={book} />;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { values } = this.props;
    return (
      <Form>
        {/* @ts-ignore */}
        <CollapsableForm openSections={OPEN_SECTIONS}>
          {/* @ts-ignore */}
          <CollapsableForm.Section header="Links" key="links">
            <LinkFields />
          {/* @ts-ignore */}
          </CollapsableForm.Section>
          {/* @ts-ignore */}
          <CollapsableForm.Section header="Basic Info" key="basic_info">
            {/* @ts-ignore */}
            <BasicInfoFields values={values} />
          {/* @ts-ignore */}
          </CollapsableForm.Section>
          {/* @ts-ignore */}
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
          {/* @ts-ignore */}
          </CollapsableForm.Section>
          {/* @ts-ignore */}
          <CollapsableForm.Section header="References" key="references">
            {/* @ts-ignore */}
            <ReferencesField values={values} />
          {/* @ts-ignore */}
          </CollapsableForm.Section>
          {/* @ts-ignore */}
          <CollapsableForm.Section header="Comments" key="comments">
            {/* @ts-ignore */}
            <CommentsField values={values} />
          {/* @ts-ignore */}
          </CollapsableForm.Section>
        </CollapsableForm>
        {/* @ts-ignore */}
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

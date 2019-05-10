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
  static getSuggestionSourceFirstTitle(suggestion) {
    return suggestion._source.titles[0].title;
  }

  static renderBookSuggestion(suggestion) {
    const book = suggestion._source;
    return <BookSuggestion book={book} />;
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
            <BasicInfoFields values={values} />
          </CollapsableForm.Section>
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

BookChapterForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired, // current form data
};

export default BookChapterForm;

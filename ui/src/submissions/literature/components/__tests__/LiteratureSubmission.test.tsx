import React from 'react';
import { shallow } from 'enzyme';
import { Formik } from 'formik';

import LiteratureSubmission from '../LiteratureSubmission';
import articleSchema from '../../schemas/article';
import ArticleForm from '../ArticleForm';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LiteratureSubmission', () => {
  // TODO: decide if this is a good aproach. (Snapshot seems to be too verbose and brittle)
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders for article document type', () => {
    const wrapper = shallow(
      <LiteratureSubmission docType="article" onSubmit={async () => {}} />
    ).dive();
    const { validationSchema, initialValues, component } = wrapper
      .find(Formik)
      .props();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(validationSchema).toEqual(articleSchema);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(initialValues).toEqual(articleSchema.cast());
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(component).toEqual(ArticleForm);
  });
});

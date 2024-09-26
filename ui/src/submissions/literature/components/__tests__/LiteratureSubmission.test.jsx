import React from 'react';
import { shallow } from 'enzyme';
import { Formik } from 'formik';

import LiteratureSubmission from '../LiteratureSubmission';
import articleSchema from '../../schemas/article';
import ArticleForm from '../ArticleForm';

describe('LiteratureSubmission', () => {
  // TODO: decide if this is a good aproach. (Snapshot seems to be too verbose and brittle)
  it('renders for article document type', () => {
    const wrapper = shallow(
      <LiteratureSubmission docType="article" onSubmit={async () => {}} />
    ).dive();
    const { validationSchema, initialValues, component } = wrapper
      .find(Formik)
      .props();
    expect(validationSchema).toEqual(articleSchema);
    expect(initialValues).toEqual(articleSchema.cast());
    expect(component).toEqual(ArticleForm);
  });
});

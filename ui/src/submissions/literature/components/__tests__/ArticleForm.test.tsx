import React from 'react';
import { shallow } from 'enzyme';

import ArticleForm from '../ArticleForm';

describe('ArticleForm', () => {
  it('renders all props', () => {
    const wrapper = shallow(
      <ArticleForm
        isSubmitting={false}
        isValidating={false}
        isValid
        values={{}}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

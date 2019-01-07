import React from 'react';
import { shallow } from 'enzyme';

import BookChapterForm from '../BookChapterForm';

describe('BookChapterForm', () => {
  it('renders all props', () => {
    const wrapper = shallow(
      <BookChapterForm
        isSubmitting={false}
        isValidating={false}
        isValid
        values={{}}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

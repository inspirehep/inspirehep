import React from 'react';
import { shallow } from 'enzyme';

import BookChapterForm from '../BookChapterForm';

describe('BookChapterForm', () => {
  it('renders all props', () => {
    const wrapper = shallow(
      <BookChapterForm
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        isSubmitting={false}
        isValidating={false}
        isValid
        values={{}}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

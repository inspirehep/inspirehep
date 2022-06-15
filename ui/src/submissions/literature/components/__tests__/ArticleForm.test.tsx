import React from 'react';
import { shallow } from 'enzyme';

import ArticleForm from '../ArticleForm';

describe('ArticleForm', () => {
  it('renders all props', () => {
    const wrapper = shallow(
      <ArticleForm
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

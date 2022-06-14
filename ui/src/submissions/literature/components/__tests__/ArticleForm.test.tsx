import React from 'react';
import { shallow } from 'enzyme';

import ArticleForm from '../ArticleForm';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ArticleForm', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});

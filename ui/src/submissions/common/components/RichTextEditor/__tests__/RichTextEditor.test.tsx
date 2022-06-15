import React from 'react';
import { shallow } from 'enzyme';

import RichTextEditor from '../RichTextEditor';

describe('RichTextEditor', () => {
  it('renders', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <RichTextEditor onChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

import React from 'react';
import { shallow } from 'enzyme';

import ArxivPdfDownloadAction from '../ArxivPdfDownloadAction';

describe('ArxivPdfDownloadAction', () => {
  it('renders with arXiv id', () => {
    const wrapper = shallow((
      <ArxivPdfDownloadAction arxivId="123.12345" />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});

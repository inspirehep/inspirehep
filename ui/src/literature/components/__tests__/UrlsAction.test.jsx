import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { DownloadOutlined } from '@ant-design/icons';

import UrlsAction from '../UrlsAction';

describe('UrlsAction', () => {
  it('renders multiple, with and without description', () => {
    const links = fromJS([
      {
        description: 'Whatever',
        value: 'https://www.whatever.com/pdfs/fulltext.pdf',
      },
      { value: 'www.descriptionless.com/fulltext.pdf' },
    ]);
    const wrapper = shallow(
      <UrlsAction
        urls={links}
        icon={<DownloadOutlined />}
        iconText="download"
        trackerEventId="PdfDownload"
      />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders single', () => {
    const links = fromJS([
      {
        description: 'Whatever',
        value: 'https://www.whatever.com/pdfs/fulltext.pdf',
      },
    ]);
    const wrapper = shallow(
      <UrlsAction
        urls={links}
        iconText="pdf"
        icon={<DownloadOutlined />}
        trackerEventId="PdfDownload"
      />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});

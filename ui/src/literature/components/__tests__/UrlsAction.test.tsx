import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { DownloadOutlined } from '@ant-design/icons';

import UrlsAction from '../UrlsAction';

<<<<<<< Updated upstream

describe('UrlsAction', () => {
  
=======
describe('UrlsAction', () => {
>>>>>>> Stashed changes
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
        text="download"
        trackerEventId="PdfDownload"
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });

  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });

>>>>>>> Stashed changes
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
        text="pdf"
        icon={<DownloadOutlined />}
        trackerEventId="PdfDownload"
      />
    );
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.dive()).toMatchSnapshot();
  });
});

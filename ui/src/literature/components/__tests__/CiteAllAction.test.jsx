import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { shallow } from 'enzyme';

import CiteAllAction from '../CiteAllAction';
import DropdownMenu from '../../../common/components/DropdownMenu';
import { CITE_FORMAT_VALUES, MAX_CITEABLE_RECORDS } from '../../constants';
import http from '../../../common/http';
import { downloadTextAsFile } from '../../../common/utils';

jest.mock('../../../common/utils');

const mockHttp = new MockAdapter(http.httpClient);
describe('CiteAllAction', () => {
  beforeEach(() => {
    downloadTextAsFile.mockClear();
  });

  it('renders with less than max citeable records results', () => {
    const wrapper = shallow(
      <CiteAllAction numberOfResults={12} query={{ q: 'ac>2000' }} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with disabled', () => {
    const wrapper = shallow(
      <CiteAllAction
        numberOfResults={MAX_CITEABLE_RECORDS + 1}
        query={{ q: 'ac>2000' }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with loading', () => {
    const wrapper = shallow(
      <CiteAllAction numberOfResults={12} query={{ q: 'ac>2000' }} />
    );
    wrapper.setState({
      loading: true,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('calls downloadTextAsFile with correct data when option is clicked', async () => {
    mockHttp
      .onGet(
        `/literature?sort=mostcited&q=query&page=1&size=${MAX_CITEABLE_RECORDS}`,
        null,
        {
          Accept: `application/${CITE_FORMAT_VALUES[1]}`,
        }
      )
      .replyOnce(200, 'Test');
    const wrapper = shallow(
      <CiteAllAction
        numberOfResults={12}
        query={{ sort: 'mostcited', q: 'query' }}
      />
    );
    await wrapper.find(DropdownMenu).prop('onClick')({
      key: CITE_FORMAT_VALUES[1],
    });
    expect(downloadTextAsFile).toHaveBeenCalledWith('Test');
  });

  it('calls downloadTextAsFile with correct data omitting page and size when option is clicked', async () => {
    mockHttp
      .onGet(
        `/literature?sort=mostrecent&q=query&page=1&size=${MAX_CITEABLE_RECORDS}`,
        null,
        {
          Accept: `application/${CITE_FORMAT_VALUES[1]}`,
        }
      )
      .replyOnce(200, 'Test');
    const wrapper = shallow(
      <CiteAllAction
        numberOfResults={12}
        query={{ sort: 'mostrecent', q: 'query', page: 10, size: 100 }}
      />
    );
    await wrapper.find(DropdownMenu).prop('onClick')({
      key: CITE_FORMAT_VALUES[1],
    });
    expect(downloadTextAsFile).toHaveBeenCalledWith('Test');
  });
});

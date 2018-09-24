import React from 'react';
import { shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';

import http from '../../http';
import Suggester from '../Suggester';

const mockHttp = new MockAdapter(http);

describe('Suggester', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('renders results onSearch', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const reponseData = {
      abstract_source: [
        {
          options: [
            {
              _id: '1',
              text: 'Result 1',
            },
            {
              _id: '2',
              text: 'Result 2',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, reponseData);
    const wrapper = shallow(
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );
    await wrapper.instance().onSearch('test');
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders results with custom template onSearch', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const reponseData = {
      abstract_source: [
        {
          options: [
            {
              _id: '1',
              text: 'Result 1',
              extra: 'Extra 1',
            },
            {
              _id: '2',
              text: 'Result 2',
              extra: 'Extra 2',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, reponseData);
    const wrapper = shallow(
      <Suggester
        pidType="literature"
        suggesterName="abstract_source"
        renderResultItem={result => `${result.text} - ${result.extra}`}
      />
    );
    await wrapper.instance().onSearch('test');
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders empty if request fails', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    mockHttp.onGet(suggesterQueryUrl).replyOnce(404);
    const wrapper = shallow(
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );
    await wrapper.instance().onSearch('test');
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});

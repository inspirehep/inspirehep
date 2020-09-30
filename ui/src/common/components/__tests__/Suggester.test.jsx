import React from 'react';
import { shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import { AutoComplete } from 'antd';

import http from '../../http';
import Suggester, { REQUEST_DEBOUNCE_MS } from '../Suggester';

const mockHttp = new MockAdapter(http.httpClient);

// TODO: use fake timers after https://github.com/facebook/jest/pull/7776
function wait(milisec = REQUEST_DEBOUNCE_MS + 25) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), milisec);
  });
}

describe('Suggester', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('renders results onSearch', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              text: 'Result 1',
            },
            {
              text: 'Result 2',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);
    const wrapper = shallow(
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );
    await wrapper.instance().onSearch('test');
    await wait();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders results with custom extractUniqueItemValue', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              text: 'Result 1',
              extra: 'Extra 1',
            },
            {
              text: 'Result 2',
              extra: 'Extra 2',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);
    const wrapper = shallow(
      <Suggester
        pidType="literature"
        suggesterName="abstract_source"
        extractUniqueItemValue={result => `${result.text} - ${result.extra}`}
      />
    );
    await wrapper.instance().onSearch('test');
    await wait();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render results onSearch without waiting for debounce', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              text: 'Result 1',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);
    const wrapper = shallow(
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );
    await wrapper.instance().onSearch('test');
    await wait(REQUEST_DEBOUNCE_MS - 25);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
    await wait(30); // TODO: investigate how this effects the next one without waiting here
  });

  it('renders results with custom result template', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              text: 'Result 1',
              extra: 'Extra 1',
            },
            {
              text: 'Result 2',
              extra: 'Extra 2',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);
    const wrapper = shallow(
      <Suggester
        pidType="literature"
        suggesterName="abstract_source"
        renderResultItem={result => (
          <span>
            {result.text} <em>{result.extra}</em>
          </span>
        )}
      />
    );
    await wrapper.instance().onSearch('test');
    await wait();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSelect with unique item value and whole suggestion', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              id: '1',
              name: 'Result',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);
    const onChange = jest.fn();
    const onSelect = jest.fn();
    const wrapper = shallow(
      <Suggester
        onChange={onChange}
        onSelect={onSelect}
        pidType="literature"
        extractUniqueItemValue={suggestion => suggestion.id}
        suggesterName="abstract_source"
      />
    );
    await wrapper.instance().onSearch('test');
    await wait();
    wrapper.update();
    const suggestionWrapper = wrapper.find(AutoComplete.Option);
    wrapper
      .find(AutoComplete)
      .simulate('select', null, suggestionWrapper.props());
    expect(onSelect).toHaveBeenCalledWith('1', {
      id: '1',
      name: 'Result',
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onSelect with unique item value and whole suggestion and onChange if extractItemCompletionValue prop is present', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    const responseData = {
      abstract_source: [
        {
          options: [
            {
              id: '1',
              name: 'Result',
            },
          ],
        },
      ],
    };
    mockHttp.onGet(suggesterQueryUrl).replyOnce(200, responseData);
    const onChange = jest.fn();
    const onSelect = jest.fn();
    const wrapper = shallow(
      <Suggester
        onChange={onChange}
        onSelect={onSelect}
        pidType="literature"
        extractItemCompletionValue={suggestion => suggestion.name}
        extractUniqueItemValue={suggestion => suggestion.id}
        suggesterName="abstract_source"
      />
    );
    await wrapper.instance().onSearch('test');
    await wait();
    wrapper.update();
    const suggestionWrapper = wrapper.find(AutoComplete.Option);
    wrapper
      .find(AutoComplete)
      .simulate('select', null, suggestionWrapper.props());
    expect(onSelect).toHaveBeenCalledWith('1', {
      id: '1',
      name: 'Result',
    });
    expect(onChange).toHaveBeenCalledWith('Result');
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

import React from 'react';
import { shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import { AutoComplete } from 'antd';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../http.ts';
import Suggester, { REQUEST_DEBOUNCE_MS } from '../Suggester';

const mockHttp = new MockAdapter(http.httpClient);

// TODO: use fake timers after https://github.com/facebook/jest/pull/7776
function wait(milisec = REQUEST_DEBOUNCE_MS + 25) {
  return new Promise(resolve => {
    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pidType: string; suggesterName: string; }'... Remove this comment to see the full error message
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pidType: string; suggesterName: string; ex... Remove this comment to see the full error message
        pidType="literature"
        suggesterName="abstract_source"
        extractUniqueItemValue={(result: any) => `${result.text} - ${result.extra}`}
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
    await wrapper.instance().onSearch('test');
    await wait();
    wrapper.update();
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders results with custom extractItemCompletionValue', async () => {
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
    const wrapper = shallow(
      <Suggester
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pidType: string; suggesterName: string; ex... Remove this comment to see the full error message
        pidType="literature"
        suggesterName="abstract_source"
        extractItemCompletionValue={(suggestion: any) => suggestion.name}
        extractUniqueItemValue={(suggestion: any) => suggestion.id}
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pidType: string; suggesterName: string; }'... Remove this comment to see the full error message
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pidType: string; suggesterName: string; re... Remove this comment to see the full error message
        pidType="literature"
        suggesterName="abstract_source"
        renderResultItem={(result: any) => <span>
          {result.text} <em>{result.extra}</em>
        </span>}
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; onSelect: any; pidType: str... Remove this comment to see the full error message
        onChange={onChange}
        onSelect={onSelect}
        pidType="literature"
        extractUniqueItemValue={(suggestion: any) => suggestion.id}
        suggesterName="abstract_source"
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; onSelect: any; pidType: str... Remove this comment to see the full error message
        onChange={onChange}
        onSelect={onSelect}
        pidType="literature"
        extractItemCompletionValue={(suggestion: any) => suggestion.name}
        extractUniqueItemValue={(suggestion: any) => suggestion.id}
        suggesterName="abstract_source"
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
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

  
  it('calls only onChange if extractItemCompletionValue prop is present and onSelect is not when an option is selected', async () => {
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
    const wrapper = shallow(
      <Suggester
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onChange: any; pidType: string; extractIte... Remove this comment to see the full error message
        onChange={onChange}
        pidType="literature"
        extractItemCompletionValue={(suggestion: any) => suggestion.name}
        extractUniqueItemValue={(suggestion: any) => suggestion.id}
        suggesterName="abstract_source"
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
    await wrapper.instance().onSearch('test');
    await wait();
    wrapper.update();
    const suggestionWrapper = wrapper.find(AutoComplete.Option);
    wrapper
      .find(AutoComplete)
      .simulate('select', null, suggestionWrapper.props());
    
    expect(onChange).toHaveBeenCalledWith('Result');
  });

  
  it('renders empty if request fails', async () => {
    const suggesterQueryUrl = '/literature/_suggest?abstract_source=test';
    mockHttp.onGet(suggesterQueryUrl).replyOnce(404);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pidType: string; suggesterName: string; }'... Remove this comment to see the full error message
      <Suggester pidType="literature" suggesterName="abstract_source" />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSearch' does not exist on type 'Compon... Remove this comment to see the full error message
    await wrapper.instance().onSearch('test');
    wrapper.update();
    
    expect(wrapper).toMatchSnapshot();
  });
});

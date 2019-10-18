import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { shallow } from 'enzyme';

import CiteAllAction from '../CiteAllAction';
import DropdownMenu from '../../../common/components/DropdownMenu';
import { CITE_FORMAT_VALUES } from '../../constants';
import http from '../../../common/http';

const mockHttp = new MockAdapter(http);
describe('CiteAllAction', () => {
  it('renders with less than 500 results', () => {
    const wrapper = shallow(
      <CiteAllAction numberOfResults={12} query={{ q: 'ac>2000' }} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with disabled', () => {
    const wrapper = shallow(
      <CiteAllAction numberOfResults={502} query={{ q: 'ac>2000' }} />
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

  it('calls OnCiteClick when option clicked', () => {
    const originalOnCiteClick = CiteAllAction.prototype.onCiteClick;
    CiteAllAction.prototype.onCiteClick = jest.fn();
    const wrapper = shallow(
      <CiteAllAction numberOfResults={12} query={{ q: 'ac>2000' }} />
    );
    wrapper.find(DropdownMenu).prop('onClick')(CITE_FORMAT_VALUES[1]);
    expect(CiteAllAction.prototype.onCiteClick).toBeCalledWith(
      CITE_FORMAT_VALUES[1]
    );
    CiteAllAction.prototype.onCiteClick = originalOnCiteClick;
  });

  // remove `calls OnCiteClick when option clicked` case, after this is enabled.
  // openCallCount stays 0 and toBeCalledWith doesn't work
  xit('calls window open with correct data', () => {
    mockHttp
      .onGet('/literature?q=query&size=500', null, {
        Accept: 'application/x-bibtex',
      })
      .replyOnce(200, 'Test');
    let openCallCount = 0;
    global.window.open = () => {
      openCallCount += 1;
    };
    const wrapper = shallow(
      <CiteAllAction numberOfResults={12} query={{ q: 'query' }} />
    );
    wrapper.find(DropdownMenu).prop('onClick')({ key: 'x-bibtex' });
    expect(openCallCount).toBe(1);
  });
});

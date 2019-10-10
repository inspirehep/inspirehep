import React from 'react';
import { shallow } from 'enzyme';

import CiteAllAction from '../CiteAllAction';
import DropdownMenu from '../../../common/components/DropdownMenu';
import { CITE_FORMAT_VALUES } from '../../constants';

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
    const onCiteClickSpy = jest.spyOn(CiteAllAction.prototype, 'onCiteClick');
    const wrapper = shallow(
      <CiteAllAction numberOfResults={12} query={{ q: 'ac>2000' }} />
    );
    wrapper.find(DropdownMenu).prop('onClick')(CITE_FORMAT_VALUES[1]);
    expect(onCiteClickSpy).toBeCalledWith(CITE_FORMAT_VALUES[1]);
    CiteAllAction.prototype.onCiteClick = originalOnCiteClick;
  });
});

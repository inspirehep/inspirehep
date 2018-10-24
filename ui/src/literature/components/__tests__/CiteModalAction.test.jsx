import React from 'react';
import { shallow } from 'enzyme';
import { Modal } from 'antd';

import CiteModalAction, { DEFAULT_SELECT_VALUE } from '../CiteModalAction';
import citeArticle from '../../citeArticle';
import SelectBox from '../../../common/components/SelectBox';
import ListItemAction from '../../../common/components/ListItemAction';

jest.mock('../../citeArticle');

describe('CiteModalAction', () => {
  beforeAll(() => {
    citeArticle.mockImplementation(
      (format, recordId) => `Cite ${recordId} in ${format}`
    );
  });

  it('renders with recordId', () => {
    const wrapper = shallow(<CiteModalAction recordId={12345} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sets modalVisible true and calls onCiteFormatChange with default format onCiteClick', () => {
    const wrapper = shallow(<CiteModalAction recordId={12345} />);
    const onCiteFormatChange = jest.fn();
    wrapper.instance().onCiteFormatChange = onCiteFormatChange;
    wrapper.update();
    const onCiteClick = wrapper.find(ListItemAction).prop('onClick');
    onCiteClick();
    expect(wrapper.state('modalVisible')).toBe(true);
    expect(onCiteFormatChange).toHaveBeenCalledWith(DEFAULT_SELECT_VALUE);
  });

  it('sets citeContent for selected format onCiteFormatChange', async () => {
    const wrapper = shallow(<CiteModalAction recordId={12345} />);
    const onCiteFormatChange = wrapper.find(SelectBox).prop('onChange');
    await onCiteFormatChange('testformat');
    expect(wrapper.state('citeContent')).toEqual('Cite 12345 in testformat');
  });

  it('sets modalVisible false onModalCancel', () => {
    const wrapper = shallow(<CiteModalAction recordId={12345} />);
    wrapper.instance().state.modalVisible = true;
    wrapper.update();
    const onModalCancel = wrapper.find(Modal).prop('onCancel');
    onModalCancel();
    expect(wrapper.state('modalVisible')).toBe(false);
  });
});

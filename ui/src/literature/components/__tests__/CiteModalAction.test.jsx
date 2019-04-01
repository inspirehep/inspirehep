import React from 'react';
import { shallow } from 'enzyme';
import { Modal, Button } from 'antd';

import CiteModalAction, { DEFAULT_FORMAT } from '../CiteModalAction';
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

  it('sets modalVisible true on cite click and calls setCiteContentFor with default format if first time', () => {
    const wrapper = shallow(<CiteModalAction recordId={12345} />);
    const setCiteContentFor = jest.fn();
    wrapper.instance().setCiteContentFor = setCiteContentFor;
    wrapper.update();
    const onCiteClick = wrapper
      .find(ListItemAction)
      .find(Button)
      .prop('onClick');
    onCiteClick();
    expect(wrapper.state('modalVisible')).toBe(true);
    expect(setCiteContentFor).toHaveBeenCalledWith(DEFAULT_FORMAT);
  });

  it('sets modalVisible true on cite click but does not call setCiteContentFor if citeContent is present', () => {
    const wrapper = shallow(<CiteModalAction recordId={12345} />);
    const setCiteContentFor = jest.fn();
    wrapper.instance().setCiteContentFor = setCiteContentFor;
    wrapper.setState({ citeContent: 'CONTENT' });
    wrapper.update();
    const onCiteClick = wrapper
      .find(ListItemAction)
      .find(Button)
      .prop('onClick');
    onCiteClick();
    expect(wrapper.state('modalVisible')).toBe(true);
    expect(setCiteContentFor).not.toHaveBeenCalled();
  });

  it('sets citeContent for selected format setCiteContentFor', async () => {
    const wrapper = shallow(<CiteModalAction recordId={12345} />);
    const setCiteContentFor = wrapper.find(SelectBox).prop('onChange');
    await setCiteContentFor('testformat');
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

import React from 'react';
import { shallow } from 'enzyme';
import { Modal, Button } from 'antd';

import CiteModalAction from '../CiteModalAction';
import citeArticle from '../../citeArticle';
import SelectBox from '../../../common/components/SelectBox';
import ListItemAction from '../../../common/components/ListItemAction';
import { CITE_FORMAT_VALUES } from '../../constants';

jest.mock('../../citeArticle');

describe('CiteModalAction', () => {
  beforeAll(() => {
    citeArticle.mockImplementation(
      (format, recordId) => `Cite ${recordId} in ${format}`
    );
  });

  it('renders with all props', () => {
    const wrapper = shallow(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onCiteFormatChange on format change', () => {
    const onCiteFormatChangeProp = jest.fn();
    const wrapper = shallow(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat={CITE_FORMAT_VALUES[0]}
        onCiteFormatChange={onCiteFormatChangeProp}
      />
    );
    wrapper.find(SelectBox).prop('onChange')(CITE_FORMAT_VALUES[1]);
    expect(onCiteFormatChangeProp).toHaveBeenCalledWith(CITE_FORMAT_VALUES[1]);
  });

  it('sets modalVisible true on cite click and calls setCiteContentFor with initialCiteFormat if first time', () => {
    const initialCiteFormat = 'x-bibtex';
    const wrapper = shallow(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
        onCiteFormatChange={jest.fn()}
      />
    );
    const setCiteContentFor = jest.fn();
    wrapper.instance().setCiteContentFor = setCiteContentFor;
    wrapper.update();
    const onCiteClick = wrapper
      .find(ListItemAction)
      .find(Button)
      .prop('onClick');
    onCiteClick();
    expect(wrapper.state('modalVisible')).toBe(true);
    expect(setCiteContentFor).toHaveBeenCalledWith(initialCiteFormat);
  });

  it('sets modalVisible true on cite click but does not call setCiteContentFor if citeContent is present', () => {
    const wrapper = shallow(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );
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

  it('shows an alert with the error message when there is an error in setCiteContentFor', () => {
    const initialCiteFormat = 'x-bibtex';
    const wrapper = shallow(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
        onCiteFormatChange={jest.fn()}
      />
    );
    const errorMessage = 'There is an error';
    wrapper.setState({ errorMessage });
    expect(wrapper).toMatchSnapshot();
  });

  it('sets citeContent for selected format setCiteContentFor', async () => {
    const wrapper = shallow(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );
    const setCiteContentFor = wrapper.find(SelectBox).prop('onChange');
    await setCiteContentFor('vnd+inspire.latex.us+x-latex');
    expect(wrapper.state('citeContent')).toEqual(
      'Cite 12345 in vnd+inspire.latex.us+x-latex'
    );
  });

  it('sets modalVisible false onModalCancel', () => {
    const wrapper = shallow(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );
    wrapper.instance().state.modalVisible = true;
    wrapper.update();
    const onModalCancel = wrapper.find(Modal).prop('onCancel');
    onModalCancel();
    expect(wrapper.state('modalVisible')).toBe(false);
  });
});

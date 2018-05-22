import React from 'react';
import { shallow } from 'enzyme';

import CiteModalAction, { DEFAULT_SELECT_VALUE } from '../CiteModalAction';
import citeArticle from '../../citeArticle';

jest.mock('../../citeArticle');

describe('CiteModalAction', () => {
  beforeAll(() => {
    citeArticle.mockImplementation((format, recordId) => `Cite ${recordId} in ${format}`);
  });

  it('renders with recordId', () => {
    const wrapper = shallow((
      <CiteModalAction recordId={12345} />
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('sets modalVisible true and calls onCiteFormatChange with default format onCiteClick', () => {
    const wrapper = shallow((
      <CiteModalAction recordId={12345} />
    ));
    const onCiteFormatChange = jest.fn();
    wrapper.instance().onCiteFormatChange = onCiteFormatChange;
    wrapper.update();
    wrapper.instance().onCiteClick();
    expect(wrapper.state('modalVisible')).toBe(true);
    expect(onCiteFormatChange).toHaveBeenCalledWith(DEFAULT_SELECT_VALUE);
  });

  it('sets citeContent for selected format onCiteFormatChange', async () => {
    const wrapper = shallow((
      <CiteModalAction recordId={12345} />
    ));
    await wrapper.instance().onCiteFormatChange('testformat');
    expect(wrapper.state('citeContent')).toEqual('Cite 12345 in testformat');
  });

  it('sets modalVisible false onModalCancel', () => {
    const wrapper = shallow((
      <CiteModalAction recordId={12345} />
    ));
    wrapper.instance().state.modalVisible = true;
    wrapper.update();
    wrapper.instance().onModalCancel();
    expect(wrapper.state('modalVisible')).toBe(false);
  });
});

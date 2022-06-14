import React from 'react';
import { shallow } from 'enzyme';
import { Modal, Button } from 'antd';

import CiteModalAction from '../CiteModalAction';
import citeArticle from '../../citeArticle';
import SelectBox from '../../../common/components/SelectBox';
import ListItemAction from '../../../common/components/ListItemAction';
import { CITE_FORMAT_VALUES } from '../../constants';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../citeArticle');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CiteModalAction', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeAll'.
  beforeAll(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
    citeArticle.mockImplementation(
      (format: any, recordId: any) => `Cite ${recordId} in ${format}`
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props', () => {
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCiteFormatChange={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onCiteFormatChange on format change', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onCiteFormatChangeProp = jest.fn();
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat={CITE_FORMAT_VALUES[0]}
        onCiteFormatChange={onCiteFormatChangeProp}
      />
    );
    wrapper.find(SelectBox).prop('onChange')(CITE_FORMAT_VALUES[1]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onCiteFormatChangeProp).toHaveBeenCalledWith(CITE_FORMAT_VALUES[1]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets modalVisible true on cite click and calls setCiteContentFor with initialCiteFormat if first time', () => {
    const initialCiteFormat = 'application/x-bibtex';
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCiteFormatChange={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const setCiteContentFor = jest.fn();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setCiteContentFor' does not exist on typ... Remove this comment to see the full error message
    wrapper.instance().setCiteContentFor = setCiteContentFor;
    wrapper.update();
    const onCiteClick = wrapper
      .find(ListItemAction)
      .find(Button)
      .prop('onClick');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onCiteClick();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.state('modalVisible')).toBe(true);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(setCiteContentFor).toHaveBeenCalledWith(initialCiteFormat);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets modalVisible true on cite click but does not call setCiteContentFor if citeContent is present', () => {
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCiteFormatChange={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const setCiteContentFor = jest.fn();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setCiteContentFor' does not exist on typ... Remove this comment to see the full error message
    wrapper.instance().setCiteContentFor = setCiteContentFor;
    wrapper.setState({ citeContent: 'CONTENT' });
    wrapper.update();
    const onCiteClick = wrapper
      .find(ListItemAction)
      .find(Button)
      .prop('onClick');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onCiteClick();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.state('modalVisible')).toBe(true);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(setCiteContentFor).not.toHaveBeenCalled();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('shows an alert with the error message when there is an error in setCiteContentFor', () => {
    const initialCiteFormat = 'application/x-bibtex';
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCiteFormatChange={jest.fn()}
      />
    );
    const errorMessage = 'There is an error';
    wrapper.setState({ errorMessage });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets citeContent for selected format setCiteContentFor', async () => {
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCiteFormatChange={jest.fn()}
      />
    );
    const setCiteContentFor = wrapper.find(SelectBox).prop('onChange');
    await setCiteContentFor('application/vnd+inspire.latex.us+x-latex');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.state('citeContent')).toEqual(
      'Cite 12345 in application/vnd+inspire.latex.us+x-latex'
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets modalVisible false onModalCancel', () => {
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCiteFormatChange={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'modalVisible' does not exist on type 'Re... Remove this comment to see the full error message
    wrapper.instance().state.modalVisible = true;
    wrapper.update();
    const onModalCancel = wrapper.find(Modal).prop('onCancel');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onModalCancel();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.state('modalVisible')).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with loading', () => {
    const initialCiteFormat = 'application/x-bibtex';
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCiteFormatChange={jest.fn()}
      />
    );
    wrapper.setState({ loading: true });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});

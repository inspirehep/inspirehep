import React, { Component } from 'react';
import { shallow } from 'enzyme';

import withFormItem from '../withFormItem';

// TODO: too artificial setup, maybe remove in the future!

class TestField extends Component {
  render() {
    return <input />;
  }
}
const WithFormItem = withFormItem(TestField);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('withFormItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes all props correctly to Form.Item and wrapped Input component (with error)', () => {
    const wrapper = shallow(
      <WithFormItem
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: { test: 'Error' }, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
        label="Test Label"
        suffixText="Test Suffix"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes all props correctly to Form.Item and wrapped Input component (without error)', () => {
    const wrapper = shallow(
      <WithFormItem
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: {}, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
        label="Test Label"
        suffixText="Test Suffix"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes props correctly to Form.Item and wrapped Input component (without error and only child)', () => {
    const wrapper = shallow(
      <WithFormItem
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        onlyChild
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: {}, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes props correctly to Form.Item and wrapped Input component (without error and custom layout)', () => {
    const wrapper = shallow(
      <WithFormItem
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: {}, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
        label="Test Label"
        wrapperCol={{ span: 10 }}
        labelCol={{ span: 3, offset: 2 }}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});

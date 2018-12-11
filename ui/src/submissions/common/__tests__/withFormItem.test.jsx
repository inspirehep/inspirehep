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

describe('withFormItem', () => {
  it('passes all props correctly to Form.Item and wrapped Input component (with error)', () => {
    const wrapper = shallow(
      <WithFormItem
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: { test: 'Error' }, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
        label="Test Label"
        suffixText="Test Suffix"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('passes all props correctly to Form.Item and wrapped Input component (without error)', () => {
    const wrapper = shallow(
      <WithFormItem
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: {}, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
        label="Test Label"
        suffixText="Test Suffix"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('passes props correctly to Form.Item and wrapped Input component (without error and only child)', () => {
    const wrapper = shallow(
      <WithFormItem
        onlyChild
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: {}, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('passes props correctly to Form.Item and wrapped Input component (without error and custom layout)', () => {
    const wrapper = shallow(
      <WithFormItem
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: {}, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
        label="Test Label"
        wrapperCol={{ span: 10 }}
        labelCol={{ span: 3, offset: 2 }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

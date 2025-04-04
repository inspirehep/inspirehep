import React from 'react';
import { render } from '@testing-library/react';

import withFormItem from '../withFormItem';

const TestField = () => <input />;
const WithFormItem = withFormItem(TestField);

describe('withFormItem', () => {
  it('passes all props correctly to Form.Item and wrapped Input component (with error)', () => {
    const { asFragment, getByText } = render(
      <WithFormItem
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: { test: 'Error' }, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
        label="Test Label"
        suffixText="Test Suffix"
      />
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByText('Error')).toBeInTheDocument();
  });

  it('passes all props correctly to Form.Item and wrapped Input component (without error)', () => {
    const { asFragment, getByText } = render(
      <WithFormItem
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: {}, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
        label="Test Label"
        suffixText="Test Suffix"
      />
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByText('Test Label')).toBeInTheDocument();
  });

  it('passes props correctly to Form.Item and wrapped Input component (without error and only child)', () => {
    const { asFragment } = render(
      <WithFormItem
        onlyChild
        field={{ name: 'test', fieldProp1: 'fp1', frieldProp2: 'fp2' }}
        form={{ errors: {}, touched: { test: true } }}
        normalProp1="np1"
        normalProp2="np2"
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('passes props correctly to Form.Item and wrapped Input component (without error and custom layout)', () => {
    const { asFragment, getByRole } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(getByRole('textbox')).toBeInTheDocument();
  });
});

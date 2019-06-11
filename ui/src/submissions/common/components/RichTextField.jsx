/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import withFormItem from '../withFormItem';
import RichTextEditor from './RichTextEditor';

class RichTextField extends Component {
  constructor(props) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onBlur() {
    const { form, name } = this.props;
    form.setFieldTouched(name, true);
  }

  onChange(content) {
    const { form, name } = this.props;
    form.setFieldValue(name, content);
  }

  render() {
    const { value, ...otherProps } = this.props;
    return (
      <RichTextEditor
        {...otherProps}
        data-test-type="rich-text"
        defaultValue={value}
        onBlur={this.onBlur}
        onChange={this.onChange}
      />
    );
  }
}

export default withFormItem(RichTextField);

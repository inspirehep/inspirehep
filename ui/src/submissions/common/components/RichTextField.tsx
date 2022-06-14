import React, { Component } from 'react';

import withFormItem from '../withFormItem';
import RichTextEditor from './RichTextEditor';

class RichTextField extends Component {
  constructor(props: any) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onBlur() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name } = this.props;
    form.setFieldTouched(name, true);
  }

  onChange(content: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name } = this.props;
    form.setFieldValue(name, content);
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { value, ...otherProps } = this.props;
    return (
      <RichTextEditor
        {...otherProps}
        data-test-type="rich-text"
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        defaultValue={value}
        onBlur={this.onBlur}
        onChange={this.onChange}
      />
    );
  }
}

export default withFormItem(RichTextField);

import { Component } from 'react';

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
    // quill 2 is buggy and not really maintained, that is why we need to clean the data before sending the form (https://github.com/VaguelySerious/react-quill/issues/62)
    form.setFieldValue(
      name,
      content
        .replaceAll(/&nbsp;/g, ' ')
        .replaceAll(/&#39;/g, "'")
        .replaceAll(/&quot;/g, '"')
        .replaceAll(/<div><\/div>/g, '<div><br/></div>')
    );
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

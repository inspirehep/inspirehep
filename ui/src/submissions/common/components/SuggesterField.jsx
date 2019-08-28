import React, { Component } from 'react';
import Suggester from '../../../common/components/Suggester';

import withFormItem from '../withFormItem';

class SuggesterField extends Component {
  constructor(props) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.hasChangedBySuggestionSelection = false;
  }

  onBlur() {
    const { form, name } = this.props;
    form.setFieldTouched(name, true);
  }

  onChange(value) {
    const { form, name, recordFieldPath } = this.props;
    form.setFieldValue(name, value);

    if (!this.hasChangedBySuggestionSelection) {
      // flag is necessary to prevent resetting $ref after select for the first time
      // because after each onSelect, onChange is fired
      form.setFieldValue(recordFieldPath, null);
    }

    this.hasChangedBySuggestionSelection = false;
  }

  onSelect(_, selectedOptionComponent) {
    const { self } = selectedOptionComponent.props.result._source;
    const { form, recordFieldPath } = this.props;
    form.setFieldValue(recordFieldPath, self);
    this.hasChangedBySuggestionSelection = true;
  }

  render() {
    const { recordFieldPath, ...restProps } = this.props;
    return (
      <Suggester
        {...restProps}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onSelect={this.onSelect}
      />
    );
  }
}

export default withFormItem(SuggesterField);

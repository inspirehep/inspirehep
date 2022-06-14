import React, { Component } from 'react';
import Suggester from '../../../common/components/Suggester';

import withFormItem from '../withFormItem';

function getSuggestionControlNumber(suggestion: $TSFixMe) {
  return String(suggestion._source.control_number);
}

class SuggesterField extends Component {
  static defaultProps: $TSFixMe;

  recordFieldPopulated: $TSFixMe;

  constructor(props: any) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.recordFieldPopulated = false;
  }

  onBlur() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name } = this.props;
    form.setFieldTouched(name, true);
  }

  onChange(value: $TSFixMe) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name, recordFieldPath } = this.props;
    form.setFieldValue(name, value);

    if (this.recordFieldPopulated) {
      form.setFieldValue(recordFieldPath, null);
      this.recordFieldPopulated = false;
    }
  }

  onSelect(controlNumber: $TSFixMe) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, recordFieldPath, pidType } = this.props;
    // TODO: only send control_number to backend, and create the $ref url there.
    const $ref = `${window.location.origin}/api/${pidType}/${controlNumber}`;
    form.setFieldValue(recordFieldPath, { $ref });
    this.recordFieldPopulated = true;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'recordFieldPath' does not exist on type ... Remove this comment to see the full error message
    const { recordFieldPath, ...restProps } = this.props;
    return (
      <Suggester
        {...restProps}
        data-test-type="suggester"
        extractUniqueItemValue={getSuggestionControlNumber}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onSelect={recordFieldPath ? this.onSelect : null}
      />
    );
  }
}

SuggesterField.defaultProps = {
  extractItemCompletionValue: (resultItem: $TSFixMe) => resultItem.text,
};

export default withFormItem(SuggesterField);

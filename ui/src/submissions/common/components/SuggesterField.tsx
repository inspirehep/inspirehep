import React, { Component } from 'react';
import Suggester from '../../../common/components/Suggester';

import withFormItem from '../withFormItem';

function getSuggestionControlNumber(suggestion: any) {
  return String(suggestion._source.control_number);
}

class SuggesterField extends Component {
  recordFieldPopulated: any;

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

  onChange(value: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name, recordFieldPath } = this.props;
    form.setFieldValue(name, value);

    if (this.recordFieldPopulated) {
      form.setFieldValue(recordFieldPath, null);
      this.recordFieldPopulated = false;
    }
  }

  onSelect(controlNumber: any) {
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ "data-test-type": string; extractUniqueIte... Remove this comment to see the full error message
        extractUniqueItemValue={getSuggestionControlNumber}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onSelect={recordFieldPath ? this.onSelect : null}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SuggesterField.defaultProps = {
  extractItemCompletionValue: (resultItem: any) => resultItem.text,
};

export default withFormItem(SuggesterField);

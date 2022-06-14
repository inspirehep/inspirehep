import React, { Component } from 'react';
import { Input } from 'antd';

type OwnProps = {
    placeholder?: string;
    focused?: boolean;
    onSearch: $TSFixMeFunction;
};

type Props = OwnProps & typeof FilterDropdown.defaultProps;

class FilterDropdown extends Component<Props> {

static defaultProps = {
    placeholder: null,
    focused: false,
};

  constructor(props: Props) {
    super(props);
    this.focusInputIfPropFocusedSet = this.focusInputIfPropFocusedSet.bind(
      this
    );
  }

  focusInputIfPropFocusedSet(input: $TSFixMe) {
    const { focused } = this.props;

    if (input != null && focused) {
      input.focus();
    }
  }

  render() {
    const { placeholder, onSearch } = this.props;
    return (
      <div>
        <Input.Search
          ref={inputRef => {
            this.focusInputIfPropFocusedSet(inputRef);
          }}
          placeholder={placeholder}
          onSearch={onSearch}
          enterButton
        />
      </div>
    );
  }
}

export default FilterDropdown;

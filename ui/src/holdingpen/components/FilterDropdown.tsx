import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

class FilterDropdown extends Component {
  constructor(props: any) {
    super(props);
    this.focusInputIfPropFocusedSet = this.focusInputIfPropFocusedSet.bind(
      this
    );
  }

  focusInputIfPropFocusedSet(input: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'focused' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { focused } = this.props;

    if (input != null && focused) {
      input.focus();
    }
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'placeholder' does not exist on type 'Rea... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
FilterDropdown.propTypes = {
  placeholder: PropTypes.string,
  focused: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
FilterDropdown.defaultProps = {
  placeholder: null,
  focused: false,
};

export default FilterDropdown;

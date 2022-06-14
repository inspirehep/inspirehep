import React, { Component } from 'react';
import { Collapse } from 'antd';
import PropTypes from 'prop-types';

import './CollapsableForm.scss';

class CollapsableForm extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'openSections' does not exist on type 'Re... Remove this comment to see the full error message
    const { openSections, ...collapseProps } = this.props;
    return (
      <Collapse
        className="__CollapsableForm__"
        bordered={false}
        {...collapseProps}
        defaultActiveKey={openSections}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
CollapsableForm.propTypes = {
  openSections: PropTypes.arrayOf(PropTypes.string),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
CollapsableForm.defaultProps = {
  openSections: [],
};

export default CollapsableForm;

import React, { Component } from 'react';
import { Collapse } from 'antd';
import PropTypes from 'prop-types';

import './CollapsableForm.less';

class CollapsableForm extends Component {
  render() {
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

CollapsableForm.Section = undefined;

CollapsableForm.propTypes = {
  openSections: PropTypes.arrayOf(PropTypes.string),
};

CollapsableForm.defaultProps = {
  openSections: [],
};

export default CollapsableForm;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';

class CollapsableFormSection extends Component {
  render() {
    const { header, ...panelProps } = this.props;
    return (
      <Collapse.Panel
        className="bg-white mb3 overflow-hidden"
        header={header && <h3 className="fw6">{header}</h3>}
        {...panelProps}
      />
    );
  }
}

CollapsableFormSection.propTypes = {
  header: PropTypes.string,
};

CollapsableFormSection.defaultProps = {
  header: null,
};

export default CollapsableFormSection;

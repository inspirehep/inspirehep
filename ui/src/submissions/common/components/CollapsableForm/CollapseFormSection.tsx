import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';

class CollapsableFormSection extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { header, ...panelProps } = this.props;
    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Collapse.Panel
        className="bg-white mb3 overflow-hidden"
        header={header && <h3 className="fw6">{header}</h3>}
        {...panelProps}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
CollapsableFormSection.propTypes = {
  header: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
CollapsableFormSection.defaultProps = {
  header: null,
};

export default CollapsableFormSection;

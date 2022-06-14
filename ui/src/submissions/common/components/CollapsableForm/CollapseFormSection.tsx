import React, { Component } from 'react';
import { Collapse } from 'antd';

type OwnProps = {
    header?: string;
};

type Props = OwnProps & typeof CollapsableFormSection.defaultProps;

class CollapsableFormSection extends Component<Props> {

static defaultProps = {
    header: null,
};

  render() {
    // @ts-expect-error ts-migrate(2700) FIXME: Rest types may only be created from object types.
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

export default CollapsableFormSection;

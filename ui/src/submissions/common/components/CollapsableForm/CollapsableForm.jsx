import { Children, Component } from 'react';
import { Collapse } from 'antd';
import PropTypes from 'prop-types';

import './CollapsableForm.less';

class CollapsableForm extends Component {
  render() {
    const { openSections, children, ...collapseProps } = this.props;

    const items = Children.map(children, (section) => {
      if (!section) {
        return section;
      }
      const {
        header,
        children: sectionChildren,
        ...sectionProps
      } = section.props;
      return {
        key: section.key,
        className: 'bg-white mb3 overflow-hidden',
        ...sectionProps,
        label: header && <h3 className="fw6 mv0">{header}</h3>,
        children: sectionChildren,
      };
    });

    return (
      <Collapse
        className="__CollapsableForm__"
        bordered={false}
        {...collapseProps}
        items={items}
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

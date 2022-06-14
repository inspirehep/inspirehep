import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Latex from '../../../common/components/Latex';
import './PartialAbstract.scss';

const PARTIAL_ABSTRACT_LENGTH = 250;

class PartialAbstract extends Component {
  constructor(props) {
    super(props);
    this.getPartialAbstract = this.getPartialAbstract.bind(this);
  }

  getPartialAbstract() {
    const { abstract } = this.props;
    if (abstract.length >= PARTIAL_ABSTRACT_LENGTH) {
      const partialAbstract = abstract.substring(0, PARTIAL_ABSTRACT_LENGTH);
      return `${partialAbstract}...`;
    }
    return abstract;
  }

  render() {
    const { abstract } = this.props;
    return (
      abstract && (
        <div className="__PartialAbstract__">
          <Latex>{this.getPartialAbstract()}</Latex>
        </div>
      )
    );
  }
}

PartialAbstract.propTypes = {
  abstract: PropTypes.string,
};

PartialAbstract.defaultProps = {
  abstract: null,
};

export default PartialAbstract;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Latex from '../../../common/components/Latex';
import './PartialAbstract.scss';

const PARTIAL_ABSTRACT_LENGTH = 250;

class PartialAbstract extends Component {
  constructor(props: any) {
    super(props);
    this.getPartialAbstract = this.getPartialAbstract.bind(this);
  }

  getPartialAbstract() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'abstract' does not exist on type 'Readon... Remove this comment to see the full error message
    const { abstract } = this.props;
    if (abstract.length >= PARTIAL_ABSTRACT_LENGTH) {
      const partialAbstract = abstract.substring(0, PARTIAL_ABSTRACT_LENGTH);
      return `${partialAbstract}...`;
    }
    return abstract;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'abstract' does not exist on type 'Readon... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
PartialAbstract.propTypes = {
  abstract: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
PartialAbstract.defaultProps = {
  abstract: null,
};

export default PartialAbstract;

import React, { Component } from 'react';
import Latex from '../../../common/components/Latex';
import './PartialAbstract.scss';

const PARTIAL_ABSTRACT_LENGTH = 250;

type OwnProps = {
    abstract?: string;
};

type Props = OwnProps & typeof PartialAbstract.defaultProps;

class PartialAbstract extends Component<Props> {

static defaultProps = {
    abstract: null,
};

  constructor(props: Props) {
    super(props);
    this.getPartialAbstract = this.getPartialAbstract.bind(this);
  }

  getPartialAbstract() {
    const { abstract } = this.props;
    if ((abstract as $TSFixMe).length >= PARTIAL_ABSTRACT_LENGTH) {
      const partialAbstract = (abstract as $TSFixMe).substring(0, PARTIAL_ABSTRACT_LENGTH);
      return `${partialAbstract}...`;
    }
    return abstract;
  }

  render() {
    const { abstract } = this.props;
    return (
      abstract && (
        <div className="__PartialAbstract__">
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <Latex>{this.getPartialAbstract()}</Latex>
        </div>
      )
    );
  }
}

export default PartialAbstract;

import React, { Component } from 'react';
import pluralizeUnlessSingle from '../../common/utils';

type OwnProps = {
    numberOfPages?: number;
};

type Props = OwnProps & typeof NumberOfPages.defaultProps;

class NumberOfPages extends Component<Props> {

static defaultProps = {
    numberOfPages: null,
};

  render() {
    const { numberOfPages } = this.props;

    return (
      numberOfPages && (
        <div>
          {numberOfPages} {pluralizeUnlessSingle('page', numberOfPages)}
        </div>
      )
    );
  }
}

export default NumberOfPages;

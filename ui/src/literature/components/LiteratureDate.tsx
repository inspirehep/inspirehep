import React, { Component } from 'react';

type OwnProps = {
    date?: string;
};

type Props = OwnProps & typeof LiteratureDate.defaultProps;

class LiteratureDate extends Component<Props> {

static defaultProps = {
    date: null,
};

  render() {
    const { date } = this.props;
    return <span>{date}</span>;
  }
}

export default LiteratureDate;

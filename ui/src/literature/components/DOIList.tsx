import React, { Component } from 'react';
import { List } from 'immutable';

import DOILink from './DOILink';
import InlineList from '../../common/components/InlineList';
import DOIMaterial from './DOIMaterial';

type OwnProps = {
    dois?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof DOIList.defaultProps;

class DOIList extends Component<Props> {

static defaultProps = {
    dois: null,
};

  static renderDoiItem(doi: $TSFixMe) {
    const material = doi.get('material');
    const value = doi.get('value');
    return (
      <span>
        <DOILink doi={value}>{value}</DOILink>
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <DOIMaterial material={material} />
      </span>
    );
  }

  render() {
    const { dois } = this.props;

    return (
      <InlineList
        label="DOI"
        items={dois}
        extractKey={(doi: $TSFixMe) => doi.get('value')}
        renderItem={DOIList.renderDoiItem}
      />
    );
  }
}

export default DOIList;

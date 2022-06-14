import React from 'react';
import { List } from 'immutable';
import InlineList from '../../common/components/InlineList';

function renderNameVariant(nameVariant: $TSFixMe) {
  return <span>{nameVariant.get('value')}</span>;
}

function extractKeyFromNameVariant(nameVariant: $TSFixMe) {
  return nameVariant.get('value');
}

type Props = {
    nameVariants?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function InstitutionsNameVariantsList({ nameVariants }: Props) {
  return (
    <InlineList
      label="Name Variants"
      items={nameVariants}
      extractKey={extractKeyFromNameVariant}
      renderItem={renderNameVariant}
    />
  );
}

export default InstitutionsNameVariantsList;

import { Map, List } from 'immutable';

export function getPapersQueryString(recordId: number) {
  return `data.record.$ref:${recordId}`;
}

export function filterDoisByMaterial(dois: List<Map<string, any>>) {
  return dois.filter((doi: Map<string, any>) => doi.get('material') === 'data');
}

export function hasAdditionalDois(dois: List<Map<string, any>>) {
  return (
    dois.filter((doi: Map<string, any>) => doi.get('material') !== 'data')
      .size > 0
  );
}

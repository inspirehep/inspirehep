import { Map, List } from "immutable";

export function getPapersQueryString(recordId: number) {
  return `refersto:recid:${recordId}`;
}

export function filterDoisByMaterial(dois: List<Map<string, any>>) {
  return dois.filter((doi: Map<string, any>) => doi.get('material') === 'data');
}

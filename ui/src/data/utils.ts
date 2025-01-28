import { Map, List } from 'immutable';
import { LITERATURE } from '../common/routes';

export function getReferencingPapersQueryString(recordId: number) {
  return `refersto:recid:${recordId}`;
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

export function transformLiteratureRecords(
  literatureRecords: any
): List<Map<string, string>> | null {
  if (literatureRecords && literatureRecords.size > 0) {
    return literatureRecords.map((record: Map<string, any>) => {
      const controlNumber = record.get('control_number');
      return Map({
        value: `${LITERATURE}/${controlNumber}`,
        description: controlNumber,
      });
    });
  }
  return null;
}

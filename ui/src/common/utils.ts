import { mergeWith, cloneDeep } from 'lodash';
import moment from 'moment-timezone';
import { List, Map, Set } from 'immutable';
// TODO: use different package suitable for typescript (this one doesn't have types)
// @ts-ignore
import NumberAbbreviator from 'number-abbreviate';
import { LITERATURE } from './routes';
import {
  SEARCH_PAGE_COL_SIZE_WITH_FACETS,
  SEARCH_PAGE_COL_SIZE_WITHOUT_FACETS,
  SEARCH_PAGE_COL_SIZE_NO_RESULTS,
} from './constants';

export function forceArray(maybeArray: any) {
  return maybeArray === undefined || Array.isArray(maybeArray)
    ? maybeArray
    : [maybeArray];
}

export function castPropToNumber(prop: any) {
  return prop !== undefined ? Number(prop) : undefined;
}

export function pluckMinMaxPair(
  list: List<number>,
  valueGetter: (item: number) => number
) {
  if (list.isEmpty()) {
    return [0, 0];
  }
  let min = Infinity;
  let max = -Infinity;

  list.forEach((item) => {
    const value = valueGetter(item);
    max = Math.max(max, value);
    min = Math.min(min, value);
  });
  return [min, max];
}

export function toNumbers(array: string[]) {
  return array && array.map(Number);
}

export function convertArrayToMap(array: any[]) {
  return array.reduce((map, item, index) => {
    map[item] = index;
    return map;
  }, {});
}

export function selfOrInfinity(number: number) {
  if (number != null) {
    return number;
  }
  return Infinity;
}

export function getSizeOfArrayOrImmutableList(arrayOrList: any[] | List<any>) {
  return Array.isArray(arrayOrList) ? arrayOrList.length : arrayOrList.size;
}

export function getFromObjectOrImmutableMap(
  objectOrMap: { [key: string]: any } | Map<string, any>,
  key: string
) {
  return Map.isMap(objectOrMap) ? objectOrMap.get(key) : objectOrMap[key];
}

export function getWrapperComponentDisplayName(
  wrapperHocName: string,
  WrappedComponentClass: any
) {
  const componentDisplayName =
    WrappedComponentClass.displayName ||
    WrappedComponentClass.name ||
    'Component';
  return `${wrapperHocName}(${componentDisplayName})`;
}

export function doSetsHaveCommonItem(set1: Set<any>, set2: Set<any>) {
  if (set1.isEmpty() && set2.isEmpty()) {
    return false;
  }
  return set1.subtract(set2).size < set1.size;
}

export function hasAnyOfKeys(map: Map<string, any>, keys: string[]) {
  return keys.some((key) => map.has(key));
}

export function isEmptyObjectShallow(object: { [key: string]: any }) {
  if (!object) {
    return true;
  }

  return !Object.keys(object).some(
    (key) => !(object[key] == null || object[key] === '')
  );
}

export function mergeWithConcattingArrays(destObject: any, ...sources: any) {
  const clonedDestObject = cloneDeep(destObject);
  // eslint-disable-next-line consistent-return
  return mergeWith(
    clonedDestObject,
    ...sources,
    // eslint-disable-next-line consistent-return
    (objValue: any, srcValue: any) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return objValue.concat(srcValue);
      }
    }
  );
}

export function httpErrorToActionPayload(httpError: any) {
  const { message } = httpError;
  if (message === 'Network Error') {
    return {
      error: { status: 'network' },
    };
  }

  const { response } = httpError;
  if (response) {
    const { data, status } = response;
    return {
      error: { status, ...data },
    };
  }

  throw httpError;
}

// adapted from facebook/fbjs shallowEqual
export function shallowEqual(
  objA: { [key: string]: any },
  objB: { [key: string]: any }
) {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  const { hasOwnProperty } = Object.prototype;
  for (let i = 0; i < keysA.length; i += 1) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}

export function getSearchRank(index: number, page: number, pageSize: number) {
  return (page - 1) * pageSize + index + 1;
}

export function wait(milisec: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milisec);
  });
}

export function pluralizeUnlessSingle(singularWord: string, count: number) {
  return count !== 1 ? `${singularWord}s` : singularWord;
}

export function pickEvenlyDistributedElements(
  array: any[],
  numberOfElements: number
) {
  if (numberOfElements <= 1) {
    throw new Error('number of elements must be greater than 1');
  }

  const step = Math.round((array.length - 1) / (numberOfElements - 1));
  const someElements = [];
  for (let i = 0; i < numberOfElements; i += 1) {
    const element = array[i * step];

    if (element) {
      someElements.push(element);
    } else {
      someElements.push(array[array.length - 1]);
      break;
    }
  }
  return someElements;
}

const protocolAndWwwRegexp = new RegExp('^(?:(https?:)?//)?(?:www.)?', 'i');
export function removeProtocolAndWwwFromUrl(url: string) {
  return url.replace(protocolAndWwwRegexp, '');
}

export function getRecordIdFromRef($ref: any) {
  if ($ref == null) {
    return null;
  }

  const parts = $ref.split('/');
  return parts[parts.length - 1];
}

export function downloadTextAsFile(
  text: string,
  filename = 'download.txt',
  type = 'text/plain'
) {
  const blob = new Blob([text], { type });
  if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
    // Edge
    (window.navigator as any).msSaveOrOpenBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

export function addOrdinalSuffix(i: number) {
  const lastDigit = i % 10;
  const lastTwoDigits = i % 100;
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${i}st`;
  }
  if (lastDigit === 2 && lastTwoDigits !== 12) {
    return `${i}nd`;
  }
  if (lastDigit === 3 && lastTwoDigits !== 13) {
    return `${i}rd`;
  }
  return `${i}th`;
}

const numberAbbreviator = new NumberAbbreviator(['K', 'M', 'B', 'T']);
export function abbreviateNumber(number: number) {
  const numberOfFractionDigits = number < 10000 ? 1 : 0;
  return numberAbbreviator.abbreviate(number, numberOfFractionDigits);
}

const HTML_TAG_REGEXP = /(<([^>]+)>)/gi;
export function stripHtml(richText: string) {
  return richText.replace(HTML_TAG_REGEXP, '');
}

export function truncateStringWithEllipsis(
  string: string,
  charCountLimit: number
) {
  if (string.length > charCountLimit) {
    const truncated = string.slice(0, charCountLimit - 3);
    return `${truncated}...`;
  }

  return string;
}

const MAX_DESCRIPTION_LENGTH = 160;
export function makeCompliantMetaDescription(description = '') {
  const withoutHtml = stripHtml(description);

  return truncateStringWithEllipsis(withoutHtml, MAX_DESCRIPTION_LENGTH);
}

export function getLiteratureSearchUrlForAuthorBAI(bai: string | undefined) {
  return `${LITERATURE}?q=${encodeURIComponent(`a ${bai}`)}`;
}

export function getAuthorName(author: Map<string, any>) {
  if (author.has('first_name')) {
    const firstName = author.get('first_name');
    const lastName = author.get('last_name', '');
    if (firstName.includes(',')) {
      const firstNameSuffixArray = firstName.split(',');
      return `${firstNameSuffixArray[0]} ${lastName}, ${
        firstNameSuffixArray[1]
      }`;
    }
    return `${firstName} ${lastName}`;
  }
  return author.get('name') || author.get('full_name');
}

export function addCommasToNumber(number: string | number) {
  return number && Number(number).toLocaleString('en-US');
}

export function getRootOfLocationPathname(pathname: string) {
  return pathname.split('/')[1];
}

export function getInstitutionName(affiliation: Map<string, any>) {
  return affiliation.get('value') || affiliation.get('institution');
}

export function doTimezonesHaveDifferentTimes(
  timezone1: string,
  timezone2: string
) {
  const now = Date.now();
  return (
    // @ts-ignore
    moment.tz.zone(timezone1).utcOffset(now) !==
    // @ts-ignore
    moment.tz.zone(timezone2).utcOffset(now)
  );
}

export function hasMonthAndYear(date: string) {
  return date.length >= 6;
}

export function hasDayMonthAndYear(date: string) {
  return date.length >= 8;
}

export function columnSize(numberOfResults: number, hasFacets?: boolean) {
  if (numberOfResults) {
    return hasFacets
      ? SEARCH_PAGE_COL_SIZE_WITH_FACETS
      : SEARCH_PAGE_COL_SIZE_WITHOUT_FACETS;
  }
  return SEARCH_PAGE_COL_SIZE_NO_RESULTS;
}

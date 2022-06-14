// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import mergeWith from 'lodash.mergewith';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import cloneDeep from 'lodash.clonedeep';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mome... Remove this comment to see the full error message
import moment from 'moment-timezone';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'numb... Remove this comment to see the full error message
import NumberAbbreviator from 'number-abbreviate';
import { LITERATURE } from './routes';

export function forceArray(maybeArray: any) {
  return maybeArray === undefined || Array.isArray(maybeArray)
    ? maybeArray
    : [maybeArray];
}

export function castPropToNumber(prop: any) {
  return prop !== undefined ? Number(prop) : undefined;
}

export function pluckMinMaxPair(list: any, valueGetter: any) {
  if (list.isEmpty()) {
    return [0, 0];
  }
  let min = Infinity;
  let max = -Infinity;

  list.forEach((item: any) => {
    const value = valueGetter(item);
    max = Math.max(max, value);
    min = Math.min(min, value);
  });
  return [min, max];
}

export function toNumbers(array: any) {
  return array && array.map(Number);
}

export function convertArrayToMap(array: any) {
  return array.reduce((map: any, item: any, index: any) => {
    map[item] = index;
    return map;
  }, {});
}

export function selfOrInfinity(number: any) {
  if (number != null) {
    return number;
  }
  return Infinity;
}

export function getSizeOfArrayOrImmutableList(arrayOrList: any) {
  return Array.isArray(arrayOrList) ? arrayOrList.length : arrayOrList.size;
}

export function getFromObjectOrImmutableMap(objectOrMap: any, key: any) {
  return Map.isMap(objectOrMap) ? objectOrMap.get(key) : objectOrMap[key];
}

export function getWrapperComponentDisplayName(
  wrapperHocName: any,
  WrappedComponentClass: any
) {
  const componentDisplayName =
    WrappedComponentClass.displayName ||
    WrappedComponentClass.name ||
    'Component';
  return `${wrapperHocName}(${componentDisplayName})`;
}

export function doSetsHaveCommonItem(set1: any, set2: any) {
  if (set1.isEmpty() && set2.isEmpty()) {
    return false;
  }
  return set1.subtract(set2).size < set1.size;
}

export function hasAnyOfKeys(map: any, keys: any) {
  return keys.some((key: any) => map.has(key));
}

export function isEmptyObjectShallow(object: any) {
  if (!object) {
    return true;
  }

  return !Object.keys(object).some(
    key => !(object[key] == null || object[key] === '')
  );
}

export function mergeWithConcattingArrays(destObject: any, ...sources: any[]) {
  const clonedDestObject = cloneDeep(destObject);
  // eslint-disable-next-line consistent-return
  return mergeWith(clonedDestObject, ...sources, (objValue: any, srcValue: any) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return objValue.concat(srcValue);
    }
  });
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
export function shallowEqual(objA: any, objB: any) {
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

export function getSearchRank(index: any, page: any, pageSize: any) {
  return (page - 1) * pageSize + index + 1;
}

export function wait(milisec: any) {
  return new Promise(resolve => {
    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
    setTimeout(() => resolve(), milisec);
  });
}

// appending `s` is all that's needed for the current usages
// TODO: do not export default (leftover)
export default function pluralizeUnlessSingle(singularWord: any, count: any) {
  return count !== 1 ? `${singularWord}s` : singularWord;
}

export function pickEvenlyDistributedElements(array: any, numberOfElements: any) {
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
export function removeProtocolAndWwwFromUrl(url: any) {
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
  text: any,
  filename = 'download.txt',
  type = 'text/plain'
) {
  const blob = new Blob([text], { type });
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'msSaveOrOpenBlob' does not exist on type... Remove this comment to see the full error message
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // Edge
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'msSaveOrOpenBlob' does not exist on type... Remove this comment to see the full error message
    window.navigator.msSaveOrOpenBlob(blob, filename);
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

export function addOrdinalSuffix(i: any) {
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
export function abbreviateNumber(number: any) {
  const numberOfFractionDigits = number < 10000 ? 1 : 0;
  return numberAbbreviator.abbreviate(number, numberOfFractionDigits);
}

const HTML_TAG_REGEXP = /(<([^>]+)>)/gi;
export function stripHtml(richText: any) {
  return richText.replace(HTML_TAG_REGEXP, '');
}

export function truncateStringWithEllipsis(string: any, charCountLimit: any) {
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

export function getLiteratureSearchUrlForAuthorBAI(bai: any) {
  return `${LITERATURE}?q=${encodeURIComponent(`a ${bai}`)}`;
}

export function getAuthorName(author: any) {
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

export function addCommasToNumber(number: any) {
  return number && Number(number).toLocaleString('en-US');
}

export function getRootOfLocationPathname(pathname: any) {
  return pathname.split('/')[1];
}

export function getInstitutionName(affiliation: any) {
  return affiliation.get('value') || affiliation.get('institution');
}

export function doTimezonesHaveDifferentTimes(timezone1: any, timezone2: any) {
  const now = Date.now();
  return (
    moment.tz.zone(timezone1).utcOffset(now) !==
    moment.tz.zone(timezone2).utcOffset(now)
  );
}

export function hasMonthAndYear(date: any) {
  return date.length >= 6;
}

export function hasDayMonthAndYear(date: any) {
  return date.length >= 8;
}

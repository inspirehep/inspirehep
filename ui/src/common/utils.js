import mergeWith from 'lodash.mergewith';
import cloneDeep from 'lodash.clonedeep';
import moment from 'moment-timezone';
import { Map } from 'immutable';
import NumberAbbreviator from 'number-abbreviate';
import { LITERATURE } from './routes';

export function forceArray(maybeArray) {
  return maybeArray === undefined || Array.isArray(maybeArray)
    ? maybeArray
    : [maybeArray];
}

export function castPropToNumber(prop) {
  return prop !== undefined ? Number(prop) : undefined;
}

export function pluckMinMaxPair(list, valueGetter) {
  if (list.isEmpty()) {
    return [0, 0];
  }
  let min = Infinity;
  let max = -Infinity;

  list.forEach(item => {
    const value = valueGetter(item);
    max = Math.max(max, value);
    min = Math.min(min, value);
  });
  return [min, max];
}

export function toNumbers(array) {
  return array && array.map(Number);
}

export function convertArrayToMap(array) {
  return array.reduce((map, item, index) => {
    map[item] = index;
    return map;
  }, {});
}

export function selfOrInfinity(number) {
  if (number != null) {
    return number;
  }
  return Infinity;
}

export function getSizeOfArrayOrImmutableList(arrayOrList) {
  return Array.isArray(arrayOrList) ? arrayOrList.length : arrayOrList.size;
}

export function getFromObjectOrImmutableMap(objectOrMap, key) {
  return Map.isMap(objectOrMap) ? objectOrMap.get(key) : objectOrMap[key];
}

export function getWrapperComponentDisplayName(
  wrapperHocName,
  WrappedComponentClass
) {
  const componentDisplayName =
    WrappedComponentClass.displayName ||
    WrappedComponentClass.name ||
    'Component';
  return `${wrapperHocName}(${componentDisplayName})`;
}

export function doSetsHaveCommonItem(set1, set2) {
  if (set1.isEmpty() && set2.isEmpty()) {
    return false;
  }
  return set1.subtract(set2).size < set1.size;
}

export function hasAnyOfKeys(map, keys) {
  return keys.some(key => map.has(key));
}

export function isEmptyObjectShallow(object) {
  if (!object) {
    return true;
  }

  return !Object.keys(object).some(
    key => !(object[key] == null || object[key] === '')
  );
}

export function mergeWithConcattingArrays(destObject, ...sources) {
  const clonedDestObject = cloneDeep(destObject);
  // eslint-disable-next-line consistent-return
  return mergeWith(clonedDestObject, ...sources, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return objValue.concat(srcValue);
    }
  });
}

export function httpErrorToActionPayload(httpError) {
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
export function shallowEqual(objA, objB) {
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

export function getSearchRank(index, page, pageSize) {
  return (page - 1) * pageSize + index + 1;
}

export function wait(milisec) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), milisec);
  });
}

// appending `s` is all that's needed for the current usages
// TODO: do not export default (leftover)
export default function pluralizeUnlessSingle(singularWord, count) {
  return count !== 1 ? `${singularWord}s` : singularWord;
}

export function pickEvenlyDistributedElements(array, numberOfElements) {
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
export function removeProtocolAndWwwFromUrl(url) {
  return url.replace(protocolAndWwwRegexp, '');
}

export function getRecordIdFromRef($ref) {
  if ($ref == null) {
    return null;
  }

  const parts = $ref.split('/');
  return parts[parts.length - 1];
}

export function downloadTextAsFile(text, type = 'application/txt') {
  const blob = new Blob([text], { type });
  // support IE & edge
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, 'download.txt');
  } else {
    const url = URL.createObjectURL(blob);
    window.open(url, '_self');
    URL.revokeObjectURL(url);
  }
}

export function addOrdinalSuffix(i) {
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
export function abbreviateNumber(number) {
  const numberOfFractionDigits = number < 10000 ? 1 : 0;
  return numberAbbreviator.abbreviate(number, numberOfFractionDigits);
}

const HTML_TAG_REGEXP = /(<([^>]+)>)/gi;
export function stripHtml(richText) {
  return richText.replace(HTML_TAG_REGEXP, '');
}

const MAX_DESCRIPTION_LENGTH = 160;
export function makeCompliantMetaDescription(description = '') {
  const withoutHtml = stripHtml(description);

  if (withoutHtml.length > 160) {
    const truncated = withoutHtml.slice(0, MAX_DESCRIPTION_LENGTH - 3);
    return `${truncated}...`;
  }

  return withoutHtml;
}

export function getLiteratureSearchUrlForAuthorBAI(bai) {
  return `${LITERATURE}?q=${encodeURIComponent(`a ${bai}`)}`;
}

export function getAuthorName(author) {
  if (author.has('first_name')) {
    const firstName = author.get('first_name');
    const lastName = author.get('last_name', '');
    return `${firstName} ${lastName}`;
  }
  return author.get('name') || author.get('full_name');
}

export function addCommasToNumber(number) {
  return number && Number(number).toLocaleString('en-US');
}

export function getRootOfLocationPathname(pathname) {
  return pathname.split('/')[1];
}

export function getInstitutionName(affiliation) {
  return affiliation.get('value') || affiliation.get('institution');
}

export function doTimezonesHaveDifferentTimes(timezone1, timezone2) {
  const now = Date.now();
  return (
    moment.tz.zone(timezone1).utcOffset(now) !==
    moment.tz.zone(timezone2).utcOffset(now)
  );
}

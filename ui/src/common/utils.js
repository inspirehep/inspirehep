import mergeWith from 'lodash.mergewith';
import cloneDeep from 'lodash.clonedeep';

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

export function getWrappedComponentDisplayName(wrapperHocName, ComponentClass) {
  const componentDisplayName =
    ComponentClass.displayName || ComponentClass.name || 'Component';
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
  const { response } = httpError;
  if (response) {
    const { data, status } = response;
    return { status, ...data };
  }
  return { status: 'network' };
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

export function wait(milisec) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), milisec);
  });
}

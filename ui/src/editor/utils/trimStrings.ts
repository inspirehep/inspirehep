import isPlainObject from './isPlainObject';

function trimStrings<T>(value: T): T {
  if (typeof value === 'string') {
    return value.trim() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => trimStrings(item)) as unknown as T;
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, trimStrings(v)])
    ) as T;
  }
  return value;
}

export default trimStrings;

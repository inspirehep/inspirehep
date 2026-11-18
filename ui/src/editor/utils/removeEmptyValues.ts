import isPlainObject from './isPlainObject';

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return isPlainObject(value) && Object.keys(value).length === 0;
}

function removeEmptyValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeEmptyValues(item))
      .filter((item) => !isEmpty(item)) as unknown as T;
  }
  if (isPlainObject(value)) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(value).forEach(([key, propertyValue]) => {
      const cleanedValue = removeEmptyValues(propertyValue);
      if (!isEmpty(cleanedValue)) {
        cleaned[key] = cleanedValue;
      }
    });
    return cleaned as T;
  }
  return value;
}

export default removeEmptyValues;

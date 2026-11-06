function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isEmptyValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return isPlainObject(value) && Object.keys(value).length === 0;
}

function pruneEmptyObjects<T>(value: T): T {
  if (Array.isArray(value)) {
    const prunedItems = value.map((item) => pruneEmptyObjects(item));
    const items = prunedItems;
    return items as unknown as T;
  }
  if (isPlainObject(value)) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(value).forEach(([key, propertyValue]) => {
      if (propertyValue === undefined) {
        return;
      }
      const prunedValue = pruneEmptyObjects(propertyValue);
      if (!isEmptyValue(prunedValue)) {
        cleaned[key] = prunedValue;
      }
    });
    return cleaned as T;
  }
  return value;
}

export default pruneEmptyObjects;

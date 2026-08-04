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

interface PruneEmptyObjectsOptions {
  // Array items are left untouched by default so that an item RJSF just
  // added via "Add new" (an empty `{}`) survives the onChange round-trip
  // and stays editable. Enable this right before submit instead.
  pruneArrayItems?: boolean;
}

function pruneEmptyObjects<T>(
  value: T,
  options: PruneEmptyObjectsOptions = {}
): T {
  if (Array.isArray(value)) {
    const prunedItems = value.map((item) => pruneEmptyObjects(item, options));
    const items = options.pruneArrayItems
      ? prunedItems.filter((item) => !isEmptyValue(item))
      : prunedItems;
    return items as unknown as T;
  }
  if (isPlainObject(value)) {
    const cleaned: Record<string, unknown> = {};
    Object.entries(value).forEach(([key, propertyValue]) => {
      if (propertyValue === undefined) {
        return;
      }
      const prunedValue = pruneEmptyObjects(propertyValue, options);
      if (!isEmptyValue(prunedValue)) {
        cleaned[key] = prunedValue;
      }
    });
    return cleaned as T;
  }
  return value;
}

export default pruneEmptyObjects;

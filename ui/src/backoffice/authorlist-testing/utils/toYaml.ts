const isContainer = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

const isEmpty = (value: object): boolean =>
  Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0;

const PLAIN_STRING = /^\p{L}[\p{L}\p{N}_ .,@/()'-]*$/u;
const RESERVED = /^(true|false|null|yes|no)$/i;

function inline(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return '[]';
  }
  if (isContainer(value)) {
    return '{}';
  }
  if (typeof value === 'string') {
    return PLAIN_STRING.test(value) &&
      !RESERVED.test(value) &&
      !/ $/.test(value)
      ? value
      : JSON.stringify(value);
  }
  return String(value);
}

function lines(value: unknown): string[] {
  if (!isContainer(value) || isEmpty(value)) {
    return [inline(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const [first, ...rest] = lines(item);
      return [`- ${first}`, ...rest.map((line) => `  ${line}`)];
    });
  }

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => {
      if (isContainer(child) && !isEmpty(child)) {
        return [`${key}:`, ...lines(child).map((line) => `  ${line}`)];
      }
      return [`${key}: ${inline(child)}`];
    }
  );
}

export default function toYaml(value: unknown): string {
  return lines(value).join('\n');
}

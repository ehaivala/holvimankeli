export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function capitalize(str: string): string {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeAll(str: string): string {
  if (!str) {
    return '';
  }
  return str
    .split(' ')
    .map((s) => capitalize(s))
    .join(' ');
}

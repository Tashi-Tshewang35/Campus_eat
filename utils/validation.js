exports.isPositiveId = value =>
  (typeof value === 'number' || (typeof value === 'string' && /^[1-9]\d*$/.test(value))) &&
  Number.isSafeInteger(Number(value)) && Number(value) > 0 && Number(value) <= 2147483647;

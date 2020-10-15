/**
 * Checks whether el is null. If true `onNull` is returned, else `el` will be returned.
 * @param {T} el element to check
 * @param {E} onNull value to be returned if `el` is null
 * @return {T|E}
 */
export const ifNull = (el, onNull) => el === null ? onNull : el

/**
 * Checks whether el is empty. If true `onNull` is returned, else `el` will be returned.
 * @param {T} el element to check
 * @param {E} onNull value to be returned if `el` is empty
 * @return {T|E}
 */
export const ifEmpty = (el, onNull) => [null, undefined, '', []].some(it => el === it) || (el instanceof Object && Object.entries(el).length === 0) ? onNull : el

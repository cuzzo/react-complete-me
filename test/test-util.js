/**
 * Clones / deep copies an object.
 *
 * @param Object obj
 *   Any object.
 *
 * @return Object
 *   obj--cloned.
 */
function clone(obj) {
  if (obj === null || typeof(obj) !== 'object') return obj;
  var temp = new Object();
  for (var key in obj) {
    temp[key] = clone(obj[key]);
  }
  return temp;
}

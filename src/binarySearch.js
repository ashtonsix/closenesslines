// gets the index of the value <= and closest to "seek"
const binarySearch = (values, seek) => {
  let lo = 0
  let hi = values.length - 1
  while (hi - lo > 1) {
    let test = Math.floor((lo + hi) / 2)
    if (values[test] < seek) lo = test
    else hi = test
  }
  if (values[hi] > seek) return lo
  if (Math.abs(values[hi] - seek) > Math.abs(values[lo] - seek)) return lo
  else return hi
}

export default binarySearch

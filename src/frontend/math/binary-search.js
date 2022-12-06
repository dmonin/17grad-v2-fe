const binarySearch = (arr, i) => {
  var mid = Math.floor(arr.length / 2);
  // console.log(arr.length, mid);
  if (arr[mid] === i) {
    // console.log('found');
    return arr[mid];
  } else if (arr[mid] < i && arr.length > 1) {
    // console.log('splice start');
    return binarySearch(arr.splice(mid, Number.MAX_VALUE), i);
  } else if (arr[mid] > i && arr.length > 1) {
    // console.log('splice end');
    return binarySearch(arr.splice(0, mid), i);
  } else {
    // console.log('not found');
    return arr[0];
    // return -1;
  }
};
export default binarySearch;
const a = [
  [1, 2],
  [2, 1],
  [3, 4],
  [5, 6],
];

var twoSum = function (nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i+1; j < nums.length-1; j++) {
      if (nums[i]+nums[j]==target){
        return [i,j]
      }
    }
  }
};

console.log(numEquivDominoPairs(a));

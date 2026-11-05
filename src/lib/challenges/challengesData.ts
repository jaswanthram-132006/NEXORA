export interface TestCase {
  input: any[];
  expected: any;
  description: string;
  hidden?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  timeLimit: string;
  tags: string[];
  description: string;
  constraints: string[];
  functionName: string;
  starterCode: {
    javascript: string;
    typescript: string;
  };
  solutionHint: string;
  testCases: TestCase[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    title: "Two Sum Target Pair",
    topic: "Arrays & Hashing",
    difficulty: "Easy",
    timeLimit: "15 min",
    tags: ["Arrays", "Hash Table", "Two Pointers"],
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice. Aim for O(n) time complexity.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Exactly one valid answer exists."],
    functionName: "twoSum",
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    },
    solutionHint: "Use a hash map to store `nums[i]` and its index `i` while traversing in a single linear pass.",
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], description: "Standard basic pair" },
      { input: [[3, 2, 4], 6], expected: [1, 2], description: "Pair not at first index" },
      { input: [[3, 3], 6], expected: [0, 1], description: "Identical duplicate values" },
      { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4], description: "Negative numbers", hidden: true },
    ],
  },
  {
    id: "inversion-count",
    title: "Inversion Count in O(n log n)",
    topic: "Divide & Conquer",
    difficulty: "Medium",
    timeLimit: "30 min",
    tags: ["Merge Sort", "Recursion", "Inversions"],
    description:
      "Given an array `arr`, count the number of inversions. An inversion is a pair `(i, j)` such that `i < j` and `arr[i] > arr[j]`. Return the total count using an augmented Merge Sort in O(n log n) time.",
    constraints: ["1 <= arr.length <= 5 * 10^4", "-10^6 <= arr[i] <= 10^6"],
    functionName: "countInversions",
    starterCode: {
      javascript: `/**
 * @param {number[]} arr
 * @return {number}
 */
function countInversions(arr) {
  let count = 0;
  // Write your O(n log n) merge-sort counting logic here
  return count;
}`,
      typescript: `function countInversions(arr: number[]): number {
  let count = 0;
  // Write your O(n log n) merge-sort counting logic here
  return count;
}`,
    },
    solutionHint: "During merge step, when an element from right array `R[j]` is smaller than `L[i]`, all remaining elements in `L` from `i` to end constitute inversions.",
    testCases: [
      { input: [[2, 4, 1, 3, 5]], expected: 3, description: "Pairs (2,1), (4,1), (4,3)" },
      { input: [[5, 4, 3, 2, 1]], expected: 10, description: "Reverse sorted maximum inversions" },
      { input: [[1, 2, 3, 4, 5]], expected: 0, description: "Already sorted array" },
      { input: [[10, 1, 2, 3, 4]], expected: 4, description: "Single large element at front", hidden: true },
    ],
  },
  {
    id: "valid-parentheses",
    title: "Valid Bracket Sequence",
    topic: "Stacks & Strings",
    difficulty: "Easy",
    timeLimit: "15 min",
    tags: ["Stack", "Strings", "Parsing"],
    description:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order.",
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    functionName: "isValid",
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
    },
    solutionHint: "Use a LIFO Stack to push opening brackets and pop matching opening brackets on closing symbols.",
    testCases: [
      { input: ["()[]{}"], expected: true, description: "Consecutive valid pairs" },
      { input: ["(]"], expected: false, description: "Mismatched closing bracket" },
      { input: ["([)]"], expected: false, description: "Improper nesting" },
      { input: ["{[]}"], expected: true, description: "Deeply nested valid bracket sequence" },
      { input: ["("], expected: false, description: "Unmatched single opening bracket", hidden: true },
    ],
  },
  {
    id: "max-subarray-sum",
    title: "Maximum Subarray Sum (Kadane's)",
    topic: "Dynamic Programming",
    difficulty: "Easy",
    timeLimit: "20 min",
    tags: ["Kadane", "DP", "Arrays"],
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum. Must run in O(n) time and O(1) auxiliary space.",
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    functionName: "maxSubArray",
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}`,
      typescript: `function maxSubArray(nums: number[]): number {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}`,
    },
    solutionHint: "Kadane's algorithm: `currentMax = max(nums[i], currentMax + nums[i])`.",
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, description: "Subarray [4,-1,2,1] has sum 6" },
      { input: [[1]], expected: 1, description: "Single positive element" },
      { input: [[5, 4, -1, 7, 8]], expected: 23, description: "Entire array with one negative" },
      { input: [[-3, -2, -5]], expected: -2, description: "All negative numbers", hidden: true },
    ],
  },
  {
    id: "lcs",
    title: "Longest Common Subsequence",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    timeLimit: "35 min",
    tags: ["DP", "Strings", "Subsequences"],
    description:
      "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    constraints: ["1 <= text1.length, text2.length <= 1000", "text1 and text2 consist of lowercase English characters."],
    functionName: "longestCommonSubsequence",
    starterCode: {
      javascript: `/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}`,
      typescript: `function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length;
  const n = text2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}`,
    },
    solutionHint: "If characters match, `dp[i][j] = 1 + dp[i-1][j-1]`. Otherwise take `max(dp[i-1][j], dp[i][j-1])`.",
    testCases: [
      { input: ["abcde", "ace"], expected: 3, description: "Common subsequence 'ace'" },
      { input: ["abc", "abc"], expected: 3, description: "Identical strings" },
      { input: ["abc", "def"], expected: 0, description: "Completely disjoint characters" },
      { input: ["bsbininm", "jmjkbkjkv"], expected: 1, description: "Sparse matching characters", hidden: true },
    ],
  },
  {
    id: "knapsack-01",
    title: "0/1 Knapsack Space Optimization",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    timeLimit: "40 min",
    tags: ["DP", "Space Optimization", "Knapsack"],
    description:
      "Given capacity `W`, weights `weights`, and values `values`, determine the maximum value that can be put in a knapsack of capacity W. Optimize space complexity down to O(W) using a 1D array traversed in reverse.",
    constraints: ["1 <= weights.length == values.length <= 1000", "1 <= W <= 2000"],
    functionName: "knapsack",
    starterCode: {
      javascript: `/**
 * @param {number} W
 * @param {number[]} weights
 * @param {number[]} values
 * @return {number}
 */
function knapsack(W, weights, values) {
  const dp = new Array(W + 1).fill(0);
  const n = weights.length;
  for (let i = 0; i < n; i++) {
    const w = weights[i];
    const v = values[i];
    for (let cap = W; cap >= w; cap--) {
      dp[cap] = Math.max(dp[cap], dp[cap - w] + v);
    }
  }
  return dp[W];
}`,
      typescript: `function knapsack(W: number, weights: number[], values: number[]): number {
  const dp: number[] = new Array(W + 1).fill(0);
  const n = weights.length;
  for (let i = 0; i < n; i++) {
    const w = weights[i];
    const v = values[i];
    for (let cap = W; cap >= w; cap--) {
      dp[cap] = Math.max(dp[cap], dp[cap - w] + v);
    }
  }
  return dp[W];
}`,
    },
    solutionHint: "Traverse capacity `cap` backwards from `W` down to `w` so each item is included at most once.",
    testCases: [
      { input: [4, [1, 2, 3], [10, 15, 40]], expected: 50, description: "Items 1 & 3: weight 1+3=4, val 10+40=50" },
      { input: [50, [10, 20, 30], [60, 100, 120]], expected: 220, description: "0/1 Knapsack items 2 & 3: weight 20+30=50, val 100+120=220 (note: for Fractional Knapsack, optimal value is 240)" },
      { input: [10, [15, 20], [100, 200]], expected: 0, description: "All items exceed knapsack capacity" },
      { input: [7, [1, 3, 4, 5], [1, 4, 5, 7]], expected: 9, description: "Multiple sub-optimal paths", hidden: true },
    ],
  },
  {
    id: "activity-selection",
    title: "Activity Selection (Interval Scheduling)",
    topic: "Greedy Algorithms",
    difficulty: "Medium",
    timeLimit: "30 min",
    tags: ["Greedy", "Sorting", "Intervals"],
    description:
      "Given start times `starts` and finish times `finishes` for `n` activities, find the maximum number of non-overlapping activities that can be performed by a single person. Earliest finish time first achieves optimal choice.",
    constraints: ["1 <= starts.length == finishes.length <= 10^4", "0 <= starts[i] < finishes[i] <= 10^9"],
    functionName: "maxActivities",
    starterCode: {
      javascript: `/**
 * @param {number[]} starts
 * @param {number[]} finishes
 * @return {number}
 */
function maxActivities(starts, finishes) {
  const activities = starts.map((s, i) => ({ start: s, finish: finishes[i] }));
  // Sort by earliest finish time
  activities.sort((a, b) => a.finish - b.finish);

  let count = 0;
  let lastFinish = -1;
  for (const act of activities) {
    if (act.start >= lastFinish) {
      count++;
      lastFinish = act.finish;
    }
  }
  return count;
}`,
      typescript: `function maxActivities(starts: number[], finishes: number[]): number {
  interface Act { start: number; finish: number; }
  const activities: Act[] = starts.map((s, i) => ({ start: s, finish: finishes[i] }));
  activities.sort((a, b) => a.finish - b.finish);

  let count = 0;
  let lastFinish = -1;
  for (const act of activities) {
    if (act.start >= lastFinish) {
      count++;
      lastFinish = act.finish;
    }
  }
  return count;
}`,
    },
    solutionHint: "Sort activities by finish time ascending; greedily accept any activity whose start time is >= previous finish time.",
    testCases: [
      { input: [[1, 3, 0, 5, 8, 5], [2, 4, 6, 7, 9, 9]], expected: 4, description: "Optimal schedule accepts 4 activities" },
      { input: [[10, 12, 20], [20, 25, 30]], expected: 2, description: "Overlapping mid activity" },
      { input: [[1, 2, 3], [4, 5, 6]], expected: 1, description: "Mutually overlapping all spans" },
    ],
  },
  {
    id: "bfs-shortest-path",
    title: "BFS Unweighted Shortest Path",
    topic: "Graph Algorithms",
    difficulty: "Medium",
    timeLimit: "30 min",
    tags: ["BFS", "Graphs", "Queue", "Shortest Path"],
    description:
      "Given `n` vertices labeled `0` to `n-1` and an undirected edge list `edges`, find the shortest distance (in number of edges) from `src` to `dst`. If unreachable, return -1.",
    constraints: ["1 <= n <= 1000", "0 <= edges.length <= 5000", "0 <= src, dst < n"],
    functionName: "shortestPathBFS",
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @param {number[][]} edges
 * @param {number} src
 * @param {number} dst
 * @return {number}
 */
function shortestPathBFS(n, edges, src, dst) {
  if (src === dst) return 0;
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const dist = new Array(n).fill(-1);
  const queue = [src];
  dist[src] = 0;

  while (queue.length > 0) {
    const u = queue.shift();
    if (u === dst) return dist[u];

    for (const v of adj[u]) {
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1;
        queue.push(v);
      }
    }
  }
  return -1;
}`,
      typescript: `function shortestPathBFS(n: number, edges: number[][], src: number, dst: number): number {
  if (src === dst) return 0;
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const dist: number[] = new Array(n).fill(-1);
  const queue: number[] = [src];
  dist[src] = 0;

  while (queue.length > 0) {
    const u = queue.shift()!;
    if (u === dst) return dist[u];

    for (const v of adj[u]) {
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1;
        queue.push(v);
      }
    }
  }
  return -1;
}`,
    },
    solutionHint: "Initialize FIFO queue with `src` and distance 0; mark nodes visited with `dist[v] = dist[u] + 1`.",
    testCases: [
      { input: [5, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], 0, 4], expected: 3, description: "Path: 0 -> 1 -> 3 -> 4 (length 3)" },
      { input: [4, [[0, 1], [2, 3]], 0, 3], expected: -1, description: "Disconnected components" },
      { input: [3, [[0, 1], [1, 2], [0, 2]], 0, 2], expected: 1, description: "Direct edge bypass" },
    ],
  },
  {
    id: "rotated-binary-search",
    title: "Search in Rotated Sorted Array",
    topic: "Divide & Conquer",
    difficulty: "Medium",
    timeLimit: "30 min",
    tags: ["Binary Search", "Arrays"],
    description:
      "Given an integer array `nums` sorted in ascending order (with distinct values) that has been rotated at some unknown pivot, find the index of `target`. Must achieve O(log n) runtime.",
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4", "All values in nums are unique."],
    functionName: "searchRotated",
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchRotated(nums, target) {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;

    // Check if left half is normally sorted
    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    } else {
      // Right half is sorted
      if (nums[mid] < target && target <= nums[high]) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }
  return -1;
}`,
      typescript: `function searchRotated(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;

    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[high]) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }
  return -1;
}`,
    },
    solutionHint: "At least one half `[low..mid]` or `[mid..high]` is always monotonically sorted. Test if target lies in that sorted range.",
    testCases: [
      { input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4, description: "Target 0 located at index 4" },
      { input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1, description: "Target not in array" },
      { input: [[1], 0], expected: -1, description: "Single element missing target" },
      { input: [[5, 1, 3], 5], expected: 0, description: "Target at front after pivot", hidden: true },
    ],
  },
  {
    id: "topological-sort",
    title: "Course Schedule / Cycle Detection",
    topic: "Graph Algorithms",
    difficulty: "Hard",
    timeLimit: "45 min",
    tags: ["Topological Sort", "DAG", "Kahn's", "DFS"],
    description:
      "There are `numCourses` courses labeled `0` to `numCourses - 1`. Given prerequisite pairs `[a, b]` meaning you must take `b` before `a`, determine if you can finish all courses (i.e. graph is a Directed Acyclic Graph).",
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000"],
    functionName: "canFinish",
    starterCode: {
      javascript: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);

  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let visited = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    visited++;

    for (const next of adj[node]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return visited === numCourses;
}`,
      typescript: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const inDegree: number[] = new Array(numCourses).fill(0);
  const adj: number[][] = Array.from({ length: numCourses }, () => []);

  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let visited = 0;
  while (queue.length > 0) {
    const node = queue.shift()!;
    visited++;

    for (const next of adj[node]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return visited === numCourses;
}`,
    },
    solutionHint: "Kahn's Algorithm: calculate in-degrees, queue nodes with 0 in-degree, decrement in-degree of neighbors, verify all nodes visited.",
    testCases: [
      { input: [2, [[1, 0]]], expected: true, description: "Simple linear dependency" },
      { input: [2, [[1, 0], [0, 1]]], expected: false, description: "Direct 2-node cycle" },
      { input: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true, description: "Diamond DAG valid dependency graph" },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: false, description: "3-node circular dependency", hidden: true },
    ],
  },
  {
    id: "kth-largest",
    title: "Kth Largest Element in an Array",
    topic: "Sorting & Heaps",
    difficulty: "Medium",
    timeLimit: "30 min",
    tags: ["Heap", "QuickSelect", "Sorting"],
    description:
      "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array. Note that it is the `k`th largest element in sorted order, not the `k`th distinct element.",
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    functionName: "findKthLargest",
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function findKthLargest(nums, k) {
  // Sort descending or use min-heap / QuickSelect
  nums.sort((a, b) => b - a);
  return nums[k - 1];
}`,
      typescript: `function findKthLargest(nums: number[], k: number): number {
  nums.sort((a, b) => b - a);
  return nums[k - 1];
}`,
    },
    solutionHint: "Can be solved with sorting in O(n log n) or with QuickSelect in O(n) average time.",
    testCases: [
      { input: [[3, 2, 1, 5, 6, 4], 2], expected: 5, description: "2nd largest in [1,2,3,4,5,6] is 5" },
      { input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4, description: "Duplicates handled correctly" },
      { input: [[1], 1], expected: 1, description: "Single element array" },
    ],
  },
  {
    id: "vertex-cover-approx",
    title: "Vertex Cover 2-Approximation Verification",
    topic: "Approximation Algorithms",
    difficulty: "Hard",
    timeLimit: "40 min",
    tags: ["Approximation", "Maximal Matching", "NP-Hard"],
    description:
      "Given number of vertices `n` and edge list `edges`, compute a 2-approximation for minimum vertex cover using maximal matching. Pick an arbitrary edge `(u, v)`, add both endpoints to cover, discard all incident edges, and repeat. Return the size of the vertex cover.",
    constraints: ["1 <= n <= 1000", "0 <= edges.length <= 5000"],
    functionName: "approxVertexCoverSize",
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @param {number[][]} edges
 * @return {number}
 */
function approxVertexCoverSize(n, edges) {
  const covered = new Set();
  for (const [u, v] of edges) {
    if (!covered.has(u) && !covered.has(v)) {
      covered.add(u);
      covered.add(v);
    }
  }
  return covered.size;
}`,
      typescript: `function approxVertexCoverSize(n: number, edges: number[][]): number {
  const covered = new Set<number>();
  for (const [u, v] of edges) {
    if (!covered.has(u) && !covered.has(v)) {
      covered.add(u);
      covered.add(v);
    }
  }
  return covered.size;
}`,
    },
    solutionHint: "The edges selected form a matching M. Any valid vertex cover must pick at least one endpoint from each edge in M, so OPT >= |M|. Adding both gives size 2|M| <= 2*OPT.",
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 4, description: "Path graph P4 matching size 2 gives 4 vertices (2-approx for OPT=2)" },
      { input: [3, [[0, 1], [1, 2], [0, 2]]], expected: 2, description: "Triangle K3 matching size 1 gives 2 vertices" },
      { input: [4, []], expected: 0, description: "Empty edge graph requires 0 vertices" },
    ],
  },
];

import { TopicContent } from "./types";

export const daaTopicsData: Record<string, TopicContent> = {
  sorting: {
    slug: "sorting",
    course: "daa",
    courseTitle: "Design & Analysis of Algorithms",
    courseHref: "/daa",
    title: "Sorting Algorithms",
    subtitle: "From Quadratic Baselines to Optimal Comparison and Linear Sorters",
    badge: "DAA Core",
    accentColor: "violet",
    complexity: {
      time: "O(n log n)",
      space: "O(n) or O(1)",
      paradigm: "Divide & Conquer / Comparison",
      bestCase: "O(n) [Insertion / Bubble with early exit]",
      worstCase: "O(n²) [Naive] / O(n log n) [Merge/Heap]",
    },
    tags: ["Divide & Conquer", "In-place", "Stable Sorting", "Recurrences"],
    overview:
      "Sorting is the foundational problem in algorithm design: arranging elements of a collection into a monotonic order. It serves as the primary testbed for studying asymptotic complexity, recursive divide-and-conquer recurrences, in-place memory usage, and information-theoretic lower bounds.",
    motivation:
      "Beyond presentation, sorted arrays enable logarithmic binary searches (O(log n)), fast duplicate elimination, geometric range queries, and optimal schedule generation. Furthermore, understanding the Ω(n log n) comparison tree barrier illuminates when and how non-comparison algorithms like Radix and Bucket sort can beat this bound.",
    keyConcepts: [
      {
        title: "Stability in Sorting",
        description:
          "A sorting algorithm is stable if two objects with equal keys appear in the same relative order in the output as they appeared in the input.",
        detail:
          "Essential for multi-key sorting (e.g. sorting by date first, then by transaction amount). Merge sort and Insertion sort are stable; QuickSort and HeapSort are generally not.",
      },
      {
        title: "Information-Theoretic Lower Bound",
        description:
          "Any comparison-based sorting algorithm requires at least Ω(n log n) comparisons in the worst case.",
        detail:
          "A decision tree for n items has n! leaves. A binary tree of height h has at most 2ʰ leaves. Therefore 2ʰ ≥ n!, leading to h ≥ log₂(n!) = Ω(n log n) by Stirling's approximation.",
      },
      {
        title: "In-Place vs Auxiliary Memory",
        description:
          "In-place sorting requires only O(1) auxiliary memory beyond the input array, excluding recursion stack frames.",
        detail:
          "HeapSort and QuickSort operate in-place (QuickSort requires O(log n) stack frames), whereas standard MergeSort demands O(n) auxiliary storage for merging buffers.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Divide & Conquer (Merge Sort)",
        description:
          "Recursively split array A[1..n] at mid = ⌊n/2⌋ into two halves until single-element subproblems remain.",
      },
      {
        step: 2,
        title: "Conquer & Recombination",
        description:
          "Solve each half independently via recursive calls, then linearly merge the sorted sub-arrays into a unified sorted buffer.",
      },
      {
        step: 3,
        title: "Pivot Partitioning (QuickSort Alternative)",
        description:
          "Select a pivot element x, partition elements such that all elements ≤ x are left and all > x are right, then recurse on sub-partitions without an expensive merge step.",
      },
      {
        step: 4,
        title: "Heapification (HeapSort Alternative)",
        description:
          "Transform array into a Max-Heap in O(n) time, then repeatedly swap root with the last index and sift-down to sort in-place in O(n log n).",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Merge Sort with Linear Merging",
      code: `export function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;

  // Linear two-pointer merge: O(left.length + right.length)
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
      explanation:
        "The recurrence relation is T(n) = 2T(n/2) + Θ(n). By Master Theorem Case 2 (a = 2, b = 2, f(n) = Θ(n)), we have n^(log₂2) = n¹, so T(n) = Θ(n log n) uniformly in best, average, and worst cases.",
    },
    walkthrough: {
      title: "Step-by-Step Trace of Merge Sort on [38, 27, 43, 3, 9, 82, 10]",
      scenario: "Sorting 7 integers using 2-way Divide and Conquer",
      steps: [
        {
          step: "Divide 1",
          state: "Left: [38, 27, 43], Right: [3, 9, 82, 10]",
          note: "Split at mid index 3",
        },
        {
          step: "Divide 2",
          state: "[38] vs [27, 43]  |  [3, 9] vs [82, 10]",
          note: "Recursive subdivision continues until length is 1",
        },
        {
          step: "Merge Base",
          state: "[27, 43] merged; [3, 9] merged; [10, 82] merged",
          note: "Base level two-pointer comparisons",
        },
        {
          step: "Merge Left",
          state: "Merge [38] with [27, 43] → [27, 38, 43]",
          note: "Left half fully sorted",
        },
        {
          step: "Merge Right",
          state: "Merge [3, 9] with [10, 82] → [3, 9, 10, 82]",
          note: "Right half fully sorted",
        },
        {
          step: "Final Merge",
          state: "Merge [27, 38, 43] with [3, 9, 10, 82] → [3, 9, 10, 27, 38, 43, 82]",
          note: "7 comparisons executed; stable result achieved",
        },
      ],
      conclusion:
        "The entire array is sorted in 3 recursive levels. Total comparisons performed: 11, well within the 7 · ⌈log₂ 7⌡ = 21 bound.",
    },
    applications: [
      "Database query engines (External Merge Sort for gigabyte-scale disk files)",
      "Linux Kernel TimSort (Hybrid of Merge Sort and Insertion Sort)",
      "Computational Geometry (Sweep-line event point sorting)",
      "Search Engine index posting lists intersection",
    ],
    simulationLink: {
      href: "/simulations/sorting",
      label: "Launch Interactive Sorting Visualizer",
    },
    relatedTopics: [
      {
        title: "Divide & Conquer",
        href: "/daa/divide-conquer",
        relationship: "Theoretical paradigm underlying Merge Sort and Strassen matrix operations",
      },
      {
        title: "Graph Algorithms",
        href: "/daa/graphs",
        relationship: "Topological sorting and priority-queue ordering in Dijkstra",
      },
      {
        title: "Randomized Algorithms",
        href: "/advanced/randomized",
        relationship: "Randomized QuickSort and Treaps with expected O(n log n) runtime",
      },
    ],
  },

  graphs: {
    slug: "graphs",
    course: "daa",
    courseTitle: "Design & Analysis of Algorithms",
    courseHref: "/daa",
    title: "Graph Algorithms",
    subtitle: "Traversals, Shortest Paths, Spanning Trees, and Network Flows",
    badge: "DAA Core",
    accentColor: "cyan",
    complexity: {
      time: "O(V + E) to O(V³)",
      space: "O(V + E)",
      paradigm: "Greedy / BFS / Dynamic Programming",
      bestCase: "O(V + E) [BFS/DFS / TopoSort]",
      worstCase: "O(V³) [Floyd-Warshall All-Pairs]",
    },
    tags: ["BFS", "DFS", "Dijkstra", "Bellman-Ford", "MST", "Topological Sort"],
    overview:
      "A graph G = (V, E) models pairwise relationships between vertices. Graph algorithms form the backbone of network routing, state-space exploration in AI, social graphs, dependency resolution in compilers, and circuit layout analysis.",
    motivation:
      "Unlike arrays where adjacency is trivial, graphs present arbitrary topological connectivity, directedness, cycles, and weights. Analyzing how depth, breadth, and edge relaxation propagate information reveals fundamental patterns of computation.",
    keyConcepts: [
      {
        title: "Breadth-First Search (BFS)",
        description:
          "Explores vertices level-by-level using a FIFO queue, guaranteeing shortest path discovery in unweighted graphs in O(V + E).",
        detail:
          "Produces a BFS tree where non-tree edges are cross edges between adjacent levels or within the same level.",
      },
      {
        title: "Depth-First Search (DFS) & Timestamps",
        description:
          "Explores as deep as possible along each branch before backtracking, assigning discovery d[u] and finishing f[u] times.",
        detail:
          "Classifies edges into Tree, Back, Forward, and Cross edges. A directed graph has a cycle if and only if DFS uncovers a back edge.",
      },
      {
        title: "Shortest Path Optimality (Dijkstra vs Bellman-Ford)",
        description:
          "Dijkstra solves Single-Source Shortest Paths with non-negative weights in O((V + E) log V) via greedy priority queue relaxation.",
        detail:
          "Bellman-Ford relaxes all |E| edges |V|-1 times in O(V · E), handling negative edge weights and detecting negative weight cycles.",
      },
      {
        title: "Minimum Spanning Tree (MST)",
        description:
          "Kruskal's (edge-based with Disjoint Set Union) and Prim's (vertex-based with Priority Queue) find minimum weight connected subgraphs in O(E log V).",
        detail:
          "Both algorithms leverage the Cut Property: the lightest edge crossing any cut (S, V \\ S) belongs to some MST.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Representation Selection",
        description:
          "Choose Adjacency List for sparse graphs (E ≪ V²) saving memory O(V + E), or Adjacency Matrix for dense graphs (E ≈ V²) for O(1) edge lookup.",
      },
      {
        step: 2,
        title: "Edge Relaxation",
        description:
          "In weighted graphs, iteratively test if dist[u] + weight(u, v) < dist[v]. If true, tighten dist[v] and update predecessor pred[v] = u.",
      },
      {
        step: 3,
        title: "Cycle & Precedence Verification",
        description:
          "Topological Sort uses reverse DFS finishing times or Kahn's in-degree zero elimination to order DAG dependencies in linear O(V + E).",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Dijkstra's Algorithm with Priority Queue",
      code: `export interface Edge { to: number; weight: number; }

export function dijkstra(n: number, adj: Edge[][], source: number): number[] {
  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;

  // Min-priority queue: [distance, vertex]
  const pq: [number, number][] = [[0, source]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;

    if (d > dist[u]) continue; // Stale entry

    for (const edge of adj[u]) {
      const newDist = dist[u] + edge.weight;
      if (newDist < dist[edge.to]) {
        dist[edge.to] = newDist;
        pq.push([newDist, edge.to]);
      }
    }
  }

  return dist;
}`,
      explanation:
        "Using a binary heap yields O((V + E) log V). With Fibonacci heaps, Dijkstra achieves O(E + V log V), optimal for dense graphs.",
    },
    walkthrough: {
      title: "BFS Traversal Trace on Directed Graph",
      scenario: "Traversing nodes {0, 1, 2, 3, 4} with source node 0",
      steps: [
        { step: "Init", state: "Queue: [0], Visited: {0}, Dist: [0, ∞, ∞, ∞, ∞]", note: "Enqueue source" },
        { step: "Pop 0", state: "Queue: [1, 2], Visited: {0, 1, 2}, Dist: [0, 1, 1, ∞, ∞]", note: "Explore neighbors 1 and 2" },
        { step: "Pop 1", state: "Queue: [2, 3], Visited: {0, 1, 2, 3}, Dist: [0, 1, 1, 2, ∞]", note: "1 discovers 3 at distance 2" },
        { step: "Pop 2", state: "Queue: [3, 4], Visited: {0, 1, 2, 3, 4}, Dist: [0, 1, 1, 2, 2]", note: "2 discovers 4 at distance 2" },
        { step: "Pop 3 & 4", state: "Queue: [], All nodes visited", note: "No unvisited neighbors remain" },
      ],
      conclusion: "All reachable nodes visited in exact distance order: 0 → {1, 2} → {3, 4}.",
    },
    applications: [
      "GPS Navigation (OSRM / Google Maps routing engines)",
      "Internet BGP Routing protocols (Shortest Path First)",
      "Compiler Build Systems (GNU Make topological dependency graphs)",
      "Social Network Recommendation Systems (Friend of friend degrees)",
    ],
    simulationLink: {
      href: "/simulations/graph-traversal",
      label: "Launch Interactive BFS / DFS Graph Simulator",
    },
    relatedTopics: [
      {
        title: "Dynamic Programming",
        href: "/daa/dp",
        relationship: "Bellman-Ford and Floyd-Warshall are DP formulations over graph topologies",
      },
      {
        title: "AI Search Algorithms",
        href: "/poai/search",
        relationship: "BFS and DFS generalized to informed state-space search (A* search)",
      },
      {
        title: "Greedy Algorithms",
        href: "/daa/greedy",
        relationship: "Kruskal's and Prim's algorithms rely directly on the greedy choice property",
      },
    ],
  },

  dp: {
    slug: "dp",
    course: "daa",
    courseTitle: "Design & Analysis of Algorithms",
    courseHref: "/daa",
    title: "Dynamic Programming",
    subtitle: "Overlapping Subproblems, Optimal Substructure, and State Transitions",
    badge: "DAA Core",
    accentColor: "emerald",
    complexity: {
      time: "O(n · W) to O(n³)",
      space: "O(n) to O(n²)",
      paradigm: "State Space Memoization & Tabulation",
      bestCase: "Problem-dependent polynomial",
      worstCase: "Pseudo-polynomial for NP-Hard variants",
    },
    tags: ["Memoization", "Tabulation", "Knapsack", "LCS", "Matrix Chain", "DAG DP"],
    overview:
      "Dynamic Programming (DP) is a systematic optimization technique that solves complex problems by decomposing them into simpler overlapping subproblems, computing each subproblem solution exactly once, and storing the results in a lookup table.",
    motivation:
      "Naive recursion often causes catastrophic exponential explosion (e.g. O(2ⁿ) for Fibonacci or Knapsack) due to redundant re-computation of identical subproblems. DP compresses this exponential search space into polynomial time by caching previously computed states.",
    keyConcepts: [
      {
        title: "Optimal Substructure",
        description:
          "An optimal solution to the overall problem contains within it optimal solutions to its subproblems.",
        detail:
          "Crucial prerequisite: if the shortest path from u to v passes through w, the subpath from u to w must also be the shortest path between u and w.",
      },
      {
        title: "Overlapping Subproblems",
        description:
          "A small space of distinct subproblems is visited repeatedly throughout a naive recursion tree.",
        detail:
          "Unlike Divide & Conquer (which splits into independent, disjoint subproblems like MergeSort), DP problems revisit the same subproblems.",
      },
      {
        title: "Top-Down (Memoization) vs Bottom-Up (Tabulation)",
        description:
          "Memoization keeps the recursive structure and caches outputs in a hashmap/array. Tabulation builds an iterative table from base cases upward.",
        detail:
          "Tabulation avoids call stack overhead and frequently allows state compression (e.g. reducing O(n²) space to O(n) rolling buffers).",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Identify Subproblem States",
        description:
          "Define the state tuple DP[i, j] representing the optimal answer for a prefix or subproblem slice.",
      },
      {
        step: 2,
        title: "Formulate State Recurrence",
        description:
          "Express DP[i, j] strictly in terms of smaller previously solved states DP[i-1, k] plus local choice cost.",
      },
      {
        step: 3,
        title: "Establish Base Cases",
        description:
          "Define boundary conditions where subproblems have trivial answers (e.g. DP[0, w] = 0 or DP[i, 0] = 0).",
      },
      {
        step: 4,
        title: "Choose Computation Order & Reconstruct",
        description:
          "Iterate through the state matrix in topological dependency order. Backtrack through decisions to recover the optimal path or item set.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "0/1 Knapsack with Space-Optimized Tabulation",
      code: `export function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  // 1D rolling array optimization: space O(W) instead of O(n · W)
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    const w = weights[i];
    const v = values[i];
    // Traverse backwards to prevent using item i multiple times
    for (let cap = capacity; cap >= w; cap--) {
      dp[cap] = Math.max(dp[cap], dp[cap - w] + v);
    }
  }

  return dp[capacity];
}`,
      explanation:
        "Time complexity is O(n · W) where n is item count and W is capacity. Since W is measured by the number of bits in its binary representation, this runtime is pseudo-polynomial.",
    },
    walkthrough: {
      title: "Longest Common Subsequence (LCS) Trace",
      scenario: 'String A = "ABCBDAB", String B = "BDCABA"',
      steps: [
        { step: "Dimensions", state: "Matrix dimensions: (7+1) × (6+1) initialized to 0", note: "DP[i][j] represents LCS of A[0..i-1] and B[0..j-1]" },
        { step: "Match Rule", state: "When A[i-1] == B[j-1]: DP[i][j] = DP[i-1][j-1] + 1", note: "Diagonal transition with matching character" },
        { step: "Mismatch Rule", state: "When A[i-1] != B[j-1]: DP[i][j] = max(DP[i-1][j], DP[i][j-1])", note: "Inherit best from top or left cell" },
        { step: "Table Completion", state: "Bottom-right cell DP[7][6] evaluates to 4", note: "LCS length is 4" },
        { step: "Backtracking", state: "Backtracking path yields: B → C → B → A (or B → D → A → B)", note: "Optimal subsequence reconstructed" },
      ],
      conclusion: 'The LCS has length 4: "BCBA". Total runtime: 7 × 6 = 42 operations instead of 2⁷ = 128 recursive evaluations.',
    },
    applications: [
      "Bioinformatics (Needleman-Wunsch & Smith-Waterman DNA sequence alignments)",
      "Financial Portfolio Allocation & Risk Budgets",
      "Git Diff & Text Editors (Myers Diff algorithm on edit graph)",
      "Speech Recognition and NLP (Viterbi algorithm on Hidden Markov Models)",
    ],
    relatedTopics: [
      {
        title: "Greedy Algorithms",
        href: "/daa/greedy",
        relationship: "Greedy is a specialized, faster single-choice subset of DP applicable when local choices are globally optimal",
      },
      {
        title: "Divide & Conquer",
        href: "/daa/divide-conquer",
        relationship: "Both break problems down; D&C handles disjoint subproblems, DP caches overlapping ones",
      },
      {
        title: "Reinforcement Learning",
        href: "/poai/agents",
        relationship: "Bellman equations in Markov Decision Processes are dynamic programming equations over stochastic states",
      },
    ],
  },

  greedy: {
    slug: "greedy",
    course: "daa",
    courseTitle: "Design & Analysis of Algorithms",
    courseHref: "/daa",
    title: "Greedy Algorithms",
    subtitle: "Locally Optimal Choices, Matroids, and Exchange Arguments",
    badge: "DAA Core",
    accentColor: "violet",
    complexity: {
      time: "O(n log n)",
      space: "O(1) to O(n)",
      paradigm: "Greedy Choice Property & Optimal Substructure",
      bestCase: "O(n) [Pre-sorted input]",
      worstCase: "O(n log n) [Dominated by sorting step]",
    },
    tags: ["Activity Selection", "Huffman Coding", "Fractional Knapsack", "Exchange Proofs"],
    overview:
      "A greedy algorithm makes the choice that looks best at the moment, without reconsidering previous choices or exploring alternate branches. When applicable, greedy algorithms are drastically faster and simpler than dynamic programming.",
    motivation:
      "While DP evaluates all candidate options across subproblems, greedy algorithms prove mathematically that a single top candidate can be chosen immediately without sacrificing global optimality.",
    keyConcepts: [
      {
        title: "Greedy-Choice Property",
        description:
          "A globally optimal solution can be arrived at by making a series of locally optimal (greedy) choices.",
        detail:
          "Proved via the 'Cut and Paste' exchange argument: assume an optimal solution O exists that differs from greedy solution G, and show that substituting G's choice into O yields an equally good or better optimal solution.",
      },
      {
        title: "Optimal Substructure",
        description:
          "An optimal solution to the problem contains within it optimal solutions to subproblems.",
        detail:
          "Once the greedy choice is made, the remaining subproblem retains the same structure.",
      },
      {
        title: "When Greedy Fails (Knapsack Distinction)",
        description:
          "Fractional Knapsack is greedily solvable by value-per-weight density, but 0/1 Knapsack fails greedily and requires DP.",
        detail:
          "In 0/1 Knapsack, taking the highest density item can leave empty space that cannot be filled, causing suboptimal packing.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Sort Candidates by Metric",
        description:
          "Order items by finish time (Interval Scheduling), cost/weight ratio (Fractional Knapsack), or edge weight (Kruskal's MST).",
      },
      {
        step: 2,
        title: "Iterate and Greedily Select",
        description:
          "Examine elements in order. If the candidate does not violate feasibility constraints, include it permanently.",
      },
      {
        step: 3,
        title: "Exchange Argument Proof",
        description:
          "Formally prove that no other sequence of choices can outperform the greedy choices using mathematical induction.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Interval Scheduling / Activity Selection",
      code: `export interface Activity {
  id: string;
  start: number;
  finish: number;
}

export function selectMaxActivities(activities: Activity[]): Activity[] {
  // Key greedy choice: Sort by EARLIEST FINISH TIME
  const sorted = [...activities].sort((a, b) => a.finish - b.finish);
  const selected: Activity[] = [];

  let lastFinish = -Infinity;

  for (const act of sorted) {
    if (act.start >= lastFinish) {
      selected.push(act);
      lastFinish = act.finish;
    }
  }

  return selected;
}`,
      explanation:
        "Sorting takes O(n log n); single-pass greedy selection takes O(n). Choosing earliest finish time leaves the maximum possible remaining time for subsequent activities.",
    },
    walkthrough: {
      title: "Activity Selection Trace",
      scenario: "Activities with [start, finish]: A(1, 4), B(3, 5), C(0, 6), D(5, 7), E(3, 9), F(5, 9), G(6, 10), H(8, 11)",
      steps: [
        { step: "Sort", state: "Sorted by finish: A(1,4), B(3,5), C(0,6), D(5,7), E(3,9), F(5,9), G(6,10), H(8,11)", note: "Ascending finish time" },
        { step: "Pick 1", state: "Select A(1, 4). Free window begins at t=4", note: "Earliest finish selected" },
        { step: "Reject B, C", state: "B(start 3 < 4) REJECT; C(start 0 < 4) REJECT", note: "Overlap conflicts" },
        { step: "Pick 2", state: "Select D(5, 7). Free window begins at t=7", note: "Compatible activity" },
        { step: "Reject E, F, G", state: "E(3<7), F(5<7), G(6<7) all REJECTED", note: "Overlap conflicts" },
        { step: "Pick 3", state: "Select H(8, 11). Final selection complete", note: "Compatible with t=7" },
      ],
      conclusion: "Maximum mutually compatible set of 3 activities chosen: {A, D, H} in O(n log n) time.",
    },
    applications: [
      "Data Compression (Huffman Coding prefix-free binary tree generation)",
      "Network Infrastructure (Prim's & Kruskal's Minimum Spanning Tree protocols)",
      "CPU Task Scheduling and Deadline Monotonic Prioritization",
      "Cash Register Change Making for Canonical Currency Systems",
    ],
    relatedTopics: [
      {
        title: "Dynamic Programming",
        href: "/daa/dp",
        relationship: "Compare with DP for problems where the greedy choice property breaks down (e.g. 0/1 Knapsack)",
      },
      {
        title: "Approximation Algorithms",
        href: "/advanced/approximation",
        relationship: "Greedy heuristics provide bounded approximation ratios for NP-Hard Set Cover and Vertex Cover",
      },
      {
        title: "Graph Algorithms",
        href: "/daa/graphs",
        relationship: "Dijkstra and Prim algorithms are quintessential greedy graph methods",
      },
    ],
  },

  "divide-conquer": {
    slug: "divide-conquer",
    course: "daa",
    courseTitle: "Design & Analysis of Algorithms",
    courseHref: "/daa",
    title: "Divide & Conquer",
    subtitle: "Recurrences, The Master Theorem, and Sub-Cubic Matrix Operations",
    badge: "DAA Core",
    accentColor: "cyan",
    complexity: {
      time: "T(n) = aT(n/b) + f(n)",
      space: "O(log n) to O(n)",
      paradigm: "Recursive Subproblem Decomposition",
      bestCase: "O(log n) [Binary Search]",
      worstCase: "O(n^log₂7) ≈ O(n^2.807) [Strassen Matrix]",
    },
    tags: ["Master Theorem", "Strassen", "Karatsuba", "Closest Pair", "Recursion Tree"],
    overview:
      "Divide and Conquer is a fundamental algorithmic paradigm based on multi-branched recursion: break the problem into several smaller subproblems of the same type, solve each subproblem recursively, and combine their solutions into a solution for the original problem.",
    motivation:
      "Beyond standard O(n log n) sorting, Divide and Conquer breaks through classical polynomial limits: Karatsuba reduces integer multiplication from O(n²) to O(n^1.585), and Strassen reduces matrix multiplication from O(n³) to O(n^2.807).",
    keyConcepts: [
      {
        title: "The Three Pillars",
        description:
          "Divide: Split into subproblems. Conquer: Solve subproblems recursively (base case if small). Combine: Merge subproblem solutions.",
        detail:
          "The efficiency hinge is often the Combine step: if combining is too slow, recursion yields no asymptotic gain.",
      },
      {
        title: "The Master Theorem",
        description:
          "Solves recurrences of the form T(n) = aT(n/b) + f(n), comparing f(n) against the watershed function n^(log_b a).",
        detail:
          "Case 1: f(n) = O(n^(log_b a - ε)) → T(n) = Θ(n^(log_b a)). Case 2: f(n) = Θ(n^(log_b a) log^k n) → T(n) = Θ(n^(log_b a) log^(k+1) n). Case 3: f(n) = Ω(n^(log_b a + ε)) plus regularity → T(n) = Θ(f(n)).",
      },
      {
        title: "Karatsuba Multiplicative Trick",
        description:
          "Multiplies two n-digit numbers using 3 recursive multiplications instead of 4 by factoring cross-terms.",
        detail:
          "Expressing (a·10ᵐ + b)(c·10ᵐ + d) as ac·10²ᵐ + ((a+b)(c+d) - ac - bd)·10ᵐ + bd achieves T(n) = 3T(n/2) + O(n) = O(n^log₂3) ≈ O(n^1.585).",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Decomposition into Independent Parts",
        description:
          "Partition problem of size n into 'a' subproblems, each of size n/b.",
      },
      {
        step: 2,
        title: "Parallel Branching",
        description:
          "Since subproblems share no shared mutable state, each can be executed independently (and in parallel across CPU cores).",
      },
      {
        step: 3,
        title: "Clever Cross-Term Combination",
        description:
          "Recombine subproblem solutions linearly or sub-linearly to prevent dominating the recurrence work.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Closest Pair of Points in 2D (O(n log n))",
      code: `export interface Point { x: number; y: number; }

export function closestPair(points: Point[]): number {
  const sortedX = [...points].sort((a, b) => a.x - b.x);
  return closestUtil(sortedX);
}

function closestUtil(pts: Point[]): number {
  const n = pts.length;
  if (n <= 3) return bruteForce(pts);

  const mid = Math.floor(n / 2);
  const midPoint = pts[mid];

  // Divide into left and right halves
  const dLeft = closestUtil(pts.slice(0, mid));
  const dRight = closestUtil(pts.slice(mid));
  let d = Math.min(dLeft, dRight);

  // Combine step: check strip around dividing line of width 2d
  const strip = pts.filter(p => Math.abs(p.x - midPoint.x) < d);
  strip.sort((a, b) => a.y - b.y);

  // Crucial geometric proof: only need to check next 7 points in strip!
  for (let i = 0; i < strip.length; i++) {
    for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < d; j++) {
      const dist = Math.hypot(strip[i].x - strip[j].x, strip[i].y - strip[j].y);
      if (dist < d) d = dist;
    }
  }

  return d;
}

function bruteForce(pts: Point[]): number {
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      min = Math.min(min, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
    }
  }
  return min;
}`,
      explanation:
        "The combine step filters points within distance d of the midline. A geometric packing argument proves at most 8 points can reside in any d × 2d box, bounding inner loop comparisons to O(1) and ensuring T(n) = 2T(n/2) + O(n log n) = O(n log² n), reducible to O(n log n) with pre-sorted y coordinates.",
    },
    walkthrough: {
      title: "Master Theorem Case Analysis",
      scenario: "Analyzing T(n) = 8T(n/2) + n² (Naive 3D matrix multiplication sub-division)",
      steps: [
        { step: "Extract Parameters", state: "a = 8 (subproblems), b = 2 (size reduction), f(n) = n²", note: "Standard form identification" },
        { step: "Compute Watershed", state: "n^(log_b a) = n^(log₂ 8) = n³", note: "Critical exponent is 3" },
        { step: "Compare f(n) vs n³", state: "f(n) = n² = O(n^(3 - 1)) where ε = 1 > 0", note: "Polynomial leaf dominance (Case 1)" },
        { step: "Conclusion", state: "T(n) = Θ(n³)", note: "Divide and conquer does not speed up naive matrix multiplication without Strassen's reduction" },
      ],
      conclusion: "Demonstrates why Strassen had to drop 'a' from 8 to 7: T(n) = 7T(n/2) + O(n²) yields Θ(n^(log₂ 7)) ≈ Θ(n^2.81).",
    },
    applications: [
      "Fast Fourier Transform (FFT) in audio processing and signal analysis (O(n log n))",
      "Graphics rendering and CAD collision detection (BVH tree traversal)",
      "High-precision Cryptography (Karatsuba & Schönhage–Strassen arithmetic)",
      "Database distributed map-reduce queries",
    ],
    relatedTopics: [
      {
        title: "Sorting Algorithms",
        href: "/daa/sorting",
        relationship: "MergeSort and QuickSort are canonical implementations of divide-and-conquer",
      },
      {
        title: "Computational Complexity",
        href: "/advanced/complexity",
        relationship: "Analyzing recurrence trees leads directly to space and time complexity hierarchy classifications",
      },
    ],
  },

  "np-completeness": {
    slug: "np-completeness",
    course: "daa",
    courseTitle: "Design & Analysis of Algorithms",
    courseHref: "/daa",
    title: "NP-Completeness",
    subtitle: "P vs NP, Polynomial-Time Reductions, and Intractable Computations",
    badge: "DAA Theory",
    accentColor: "emerald",
    complexity: {
      time: "2^O(n) [Known worst-case]",
      space: "Poly(n) in PSPACE",
      paradigm: "Polynomial-Time Many-One Reductions (≤p)",
      bestCase: "Heuristic approximation",
      worstCase: "Super-polynomial / Exponential",
    },
    tags: ["P vs NP", "Cook-Levin", "3-SAT", "Clique", "Vertex Cover", "Reductions"],
    overview:
      "NP-Completeness formalizes what makes computational problems intrinsically hard. It identifies a class of decision problems for which no polynomial-time solving algorithm is known, yet any proposed solution can be verified in polynomial time.",
    motivation:
      "Recognizing that a problem is NP-Complete prevents engineers from wasting months searching for non-existent polynomial algorithms, guiding them instead toward approximation algorithms, branch-and-bound, randomized heuristics, or SAT solvers.",
    keyConcepts: [
      {
        title: "The Complexity Classes P and NP",
        description:
          "P contains problems decidable by a deterministic Turing machine in O(nᵏ) time. NP contains problems verifiable in polynomial time by a certificate.",
        detail:
          "If P = NP, finding a solution is no harder than checking one, revolutionizing cryptography, mathematics, and optimization.",
      },
      {
        title: "Cook-Levin Theorem & SAT",
        description:
          "Boolean Satisfiability (SAT) was proved by Stephen Cook and Leonid Levin (1971) to be the first NP-Complete problem.",
        detail:
          "Any polynomial verification computation of any non-deterministic machine can be encoded into a giant CNF boolean formula.",
      },
      {
        title: "Polynomial-Time Reductions (A ≤p B)",
        description:
          "Problem A reduces to B in polynomial time if an algorithm for B can solve A via a polynomial-time translator.",
        detail:
          "If A is known to be NP-Hard and A ≤p B, then B must also be NP-Hard. This creates the chain: 3-SAT ≤p Independent Set ≤p Vertex Cover ≤p Clique.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Prove Membership in NP",
        description:
          "Demonstrate that given an input and a certificate/witness, a deterministic verifier runs in polynomial time.",
      },
      {
        step: 2,
        title: "Select Known NP-Complete Problem (X)",
        description:
          "Choose an appropriate reference problem (e.g. 3-SAT, Subset Sum, Hamiltonian Cycle).",
      },
      {
        step: 3,
        title: "Construct Reduction Function f",
        description:
          "Transform any instance I_x of X into an instance I_y of your target problem Y in polynomial time.",
      },
      {
        step: 4,
        title: "Prove Both Directions (If and Only If)",
        description:
          "Show I_x is a YES instance of X ⇔ f(I_x) is a YES instance of Y.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Polynomial Verifier for Vertex Cover (Certificate Verification in O(V + E))",
      code: `export interface Edge { u: number; v: number; }

/**
 * A polynomial verifier for Vertex Cover.
 * Given graph G = (V, E), target k, and proposed certificate subset S ⊆ V:
 * Verifies if |S| <= k and every edge in E touches at least one vertex in S.
 */
export function verifyVertexCover(
  numVertices: number,
  edges: Edge[],
  k: number,
  certificateSubset: number[]
): boolean {
  // 1. Check certificate size <= k
  if (certificateSubset.length > k) return false;

  const inCover = new Set(certificateSubset);

  // 2. Check every edge has at least one endpoint in cover: O(|E|)
  for (const edge of edges) {
    if (!inCover.has(edge.u) && !inCover.has(edge.v)) {
      return false; // Edge uncovered!
    }
  }

  return true; // Valid certificate: Proves Vertex Cover is in NP!
}`,
      explanation:
        "Because verification runs in linear O(|E| + |S|) deterministic time, Vertex Cover is formally proven to be in the class NP.",
    },
    walkthrough: {
      title: "Reduction Trace: 3-SAT to Independent Set",
      scenario: 'Clause: (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ ¬x₃)',
      steps: [
        { step: "Gadget Creation", state: "Create a triangle of 3 vertices for clause 1, and another triangle for clause 2", note: "Each clause forms an independent triangle gadget" },
        { step: "Intra-Gadget Edges", state: "Add edges between literals in the same clause (triangle enforces at most 1 true literal)", note: "Prevents picking 2 literals from same clause" },
        { step: "Contradiction Edges", state: "Connect x₁ to ¬x₁, x₂ to ¬x₂, etc. across gadgets", note: "Enforces consistent boolean assignment" },
        { step: "Target Formulation", state: "Target independent set size k = m = 2 (number of clauses)", note: "One true literal per clause" },
      ],
      conclusion: "Formula is satisfiable ⇔ Graph has an independent set of size equal to clause count m. Reduction executes in O(m²) time.",
    },
    applications: [
      "Airline Crew and Fleet Scheduling (Set Cover / Integer Linear Programming)",
      "Logistics Vehicle Routing Problem (Traveling Salesperson variant)",
      "Circuit Logic Verification and FPGA routing",
      "Public-Key Cryptography foundation (Lattice problems and hardness assumptions)",
    ],
    relatedTopics: [
      {
        title: "Approximation Algorithms",
        href: "/advanced/approximation",
        relationship: "The direct practical answer to NP-Completeness: achieving provable polynomial bounds (e.g. 2-approximation for Vertex Cover)",
      },
      {
        title: "Parameterized Complexity",
        href: "/advanced/parameterized",
        relationship: "Fixed-Parameter Tractable (FPT) algorithms solve NP-Hard problems efficiently when parameters are small",
      },
      {
        title: "Computational Complexity",
        href: "/advanced/complexity",
        relationship: "Detailed landscape of PSPACE, co-NP, and polynomial hierarchies",
      },
    ],
  },
};

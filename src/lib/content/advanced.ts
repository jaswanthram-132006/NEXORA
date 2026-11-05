import { TopicContent } from "./types";

export const advancedTopicsData: Record<string, TopicContent> = {
  approximation: {
    slug: "approximation",
    course: "advanced",
    courseTitle: "Advanced Algorithms & AI",
    courseHref: "/advanced",
    title: "Approximation Algorithms",
    subtitle: "Provable Bounded Performance Guarantees for Intractable NP-Hard Problems",
    badge: "Advanced Theory",
    accentColor: "violet",
    complexity: {
      time: "Polynomial O(n^k)",
      space: "O(n + m)",
      paradigm: "Relaxation, Primal-Dual, and Greedy Bounding",
      bestCase: "PTAS / FPTAS (1 + ε)",
      worstCase: "APX-Hard / Inapproximable bounds (e.g. Clique n^(1-ε))",
    },
    tags: ["PTAS", "Vertex Cover", "Metric TSP", "Christofides", "Set Cover", "Linear Programming Relaxation"],
    overview:
      "When a problem is NP-Hard, polynomial-time algorithms that compute exact global optima are mathematically impossible unless P = NP. Approximation algorithms sacrifice exactness for efficiency, guaranteeing solutions whose cost is provably within a factor ρ of the true optimum in polynomial time.",
    motivation:
      "Engineers facing real-world industrial intractability (logistics routing, network wire routing, cloud server packing) cannot wait exponential decades for an answer. Approximation theory provides mathematically certified performance bounds, distinguishing problems that can be approximated within 1% (Knapsack) from those that resist any constant-factor approximation (Clique).",
    keyConcepts: [
      {
        title: "Approximation Ratio ρ",
        description:
          "An algorithm has approximation ratio ρ if for all inputs: max(C/C*, C*/C) ≤ ρ, where C is the algorithm's cost and C* is the optimal cost.",
        detail:
          "A 2-approximation for minimization guarantees the solution cost is at most 2 × OPT. For maximization, a 0.5-approximation guarantees at least 50% of OPT.",
      },
      {
        title: "Approximation Schemes (PTAS & FPTAS)",
        description:
          "A Polynomial-Time Approximation Scheme (PTAS) computes a (1 + ε)-approximation in O(n^(f(1/ε))) time. A Fully PTAS (FPTAS) runs in Poly(n, 1/ε).",
        detail:
          "Knapsack admits an FPTAS via dynamic programming on scaled values running in O(n³ / ε).",
      },
      {
        title: "Linear Programming Relaxation & Randomized Rounding",
        description:
          "Formulate integer constraints x_i ∈ {0, 1} as continuous intervals x_i ∈ [0, 1], solve in polynomial time via LP solvers, and round fractional values.",
        detail:
          "Provides a natural lower/upper bound for bounding the integrality gap.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Lower Bounding OPT without Knowing OPT",
        description:
          "Identify an easily computed mathematical lower bound L ≤ OPT (e.g. fractional LP solution or maximal matching size).",
      },
      {
        step: 2,
        title: "Algorithmic Construction",
        description:
          "Execute a polynomial strategy (greedy selection, primal-dual updates, or rounding).",
      },
      {
        step: 3,
        title: "Ratio Certification",
        description:
          "Prove that the generated solution cost C satisfies C ≤ ρ · L ≤ ρ · OPT.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "2-Approximation for Minimum Vertex Cover via Maximal Matching",
      code: `export interface Edge { u: number; v: number; }

/**
 * 2-Approximation Algorithm for Minimum Vertex Cover.
 * Runs in O(V + E) time.
 * Proof: If M is a maximal matching, OPT must pick at least 1 vertex from each edge in M.
 * Therefore, |OPT| >= |M|.
 * This algorithm picks BOTH endpoints of every edge in M, so |Cover| = 2|M| <= 2|OPT|.
 */
export function approximateVertexCover(edges: Edge[]): number[] {
  const cover = new Set<number>();
  const matchedEdges: Edge[] = [];

  for (const edge of edges) {
    // If neither endpoint is already covered, take this edge into matching M
    if (!cover.has(edge.u) && !cover.has(edge.v)) {
      cover.add(edge.u);
      cover.add(edge.v);
      matchedEdges.push(edge);
    }
  }

  return Array.from(cover);
}`,
      explanation:
        "Because edges in M share no vertices, any valid vertex cover must select at least one distinct vertex per matched edge, establishing |OPT| ≥ |M|. The algorithm selects exactly 2|M| vertices, achieving a certified 2-approximation in linear O(E) time.",
    },
    walkthrough: {
      title: "Metric TSP Christofides-Serdyukov (1.5-Approximation) Trace",
      scenario: "Finding a Traveling Salesperson tour on a metric graph satisfying triangle inequality",
      steps: [
        { step: "Step 1: MST", state: "Compute Minimum Spanning Tree T. Cost(T) < OPT", note: "Removing any edge from OPT tour yields a spanning tree" },
        { step: "Step 2: Odd Vertices", state: "Identify set O of vertices with odd degree in T (Handshaking lemma: |O| is even)", note: "Must have even number of odd vertices" },
        { step: "Step 3: Min-Weight Matching", state: "Compute minimum weight perfect matching M on subgraph induced by O. Cost(M) ≤ 0.5 · OPT", note: "Key insight bounding additional cost" },
        { step: "Step 4: Eulerian Multigraph", state: "Combine T and M to form Eulerian multigraph G' where every vertex has even degree", note: "Cost(G') = Cost(T) + Cost(M) ≤ 1.5 · OPT" },
        { step: "Step 5: Shortcut Eulerian Circuit", state: "Traverse Eulerian circuit, skipping already-visited nodes (shortcuts cannot increase cost due to triangle inequality)", note: "Output valid Hamiltonian cycle" },
      ],
      conclusion: "Constructed valid TSP cycle with total cost guaranteed ≤ 1.5 × OPT in O(V³) time.",
    },
    applications: [
      "Airline Hub Fleet Scheduling & Crew Pairing",
      "Network Backbone Router Placement (Facility Location & Set Cover)",
      "Chip Fabrication Laser Drilling (Metric TSP path minimization)",
      "Cloud Compute Cluster Job Packing (Bin Packing heuristics)",
    ],
    relatedTopics: [
      {
        title: "NP-Completeness",
        href: "/daa/np-completeness",
        relationship: "Approximation algorithms are the primary algorithmic remedy to NP-Completeness",
      },
      {
        title: "Randomized Algorithms",
        href: "/advanced/randomized",
        relationship: "Randomized rounding of linear programming relaxations achieves optimal approximation ratios",
      },
    ],
  },

  randomized: {
    slug: "randomized",
    course: "advanced",
    courseTitle: "Advanced Algorithms & AI",
    courseHref: "/advanced",
    title: "Randomized Algorithms",
    subtitle: "Monte Carlo vs Las Vegas, Universal Hashing, Karger's Min-Cut, and Treaps",
    badge: "Advanced Theory",
    accentColor: "cyan",
    complexity: {
      time: "O(n) to O(n log n) expected",
      space: "O(n)",
      paradigm: "Probabilistic Random Coin Tosses",
      bestCase: "Drastic simplification over deterministic counterparts",
      worstCase: "Bounded failure probability 2^-k",
    },
    tags: ["Las Vegas", "Monte Carlo", "Karger Min-Cut", "Skip Lists", "Universal Hashing", "Chernoff Bounds"],
    overview:
      "A randomized algorithm employs a degree of randomness as part of its logic. The algorithm typically uses a pseudo-random bit generator to make choices, breaking symmetry and escaping worst-case inputs crafted by an adversary.",
    motivation:
      "Randomized algorithms are frequently dramatically simpler, faster, and more memory-efficient than their deterministic counterparts. While deterministic Median-of-Medians selection requires cumbersome constant factors, randomized QuickSelect achieves expected O(n) in 15 lines of code.",
    keyConcepts: [
      {
        title: "Las Vegas vs Monte Carlo",
        description:
          "Las Vegas algorithms always produce the correct answer, but their running time is a random variable (e.g. Randomized QuickSort).",
        detail:
          "Monte Carlo algorithms have deterministic running times, but their output has a small, bounded probability of error (e.g. Miller-Rabin Primality Test).",
      },
      {
        title: "Linearity of Expectation",
        description:
          "E[X + Y] = E[X] + E[Y], holding even when random variables X and Y are completely dependent.",
        detail:
          "The most powerful tool in probabilistic analysis: used to prove expected QuickSort comparisons = 2n ln n.",
      },
      {
        title: "Amplification of Success Probability",
        description:
          "Running an independent Monte Carlo algorithm with failure probability p for k independent rounds reduces failure probability to p^k.",
        detail:
          "With p = 1/2, running 100 trials drops failure chance to 2⁻¹⁰⁰ ≈ 10⁻³⁰, lower than cosmic ray hardware fault rates.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Random Pivot / Choice Injection",
        description:
          "Draw uniformly distributed random integers to select pivots, hash seed functions, or contraction edges.",
      },
      {
        step: 2,
        title: "Tail Bound Verification",
        description:
          "Use Markov's, Chebyshev's, or Chernoff bounds to prove that the probability of deviating from expected performance decays exponentially.",
      },
      {
        step: 3,
        title: "Adversary Neutralization",
        description:
          "Because coin flips are private and generated at runtime, no fixed worst-case input can consistently force worst-case behavior.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Randomized QuickSelect (Expected O(n) Median Selection)",
      code: `export function quickSelect(arr: number[], k: number): number {
  if (arr.length === 1) return arr[0];

  // Random pivot selection defeats worst-case sorted inputs
  const pivotIdx = Math.floor(Math.random() * arr.length);
  const pivot = arr[pivotIdx];

  const left = arr.filter(x => x < pivot);
  const mid = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  if (k < left.length) {
    return quickSelect(left, k);
  } else if (k < left.length + mid.length) {
    return pivot;
  } else {
    return quickSelect(right, k - left.length - mid.length);
  }
}`,
      explanation:
        "The expected recurrence is T(n) ≤ T(3n/4) + O(n). By geometric summation, T(n) = O(n) on average, solving order-statistic queries in linear time without sorting.",
    },
    walkthrough: {
      title: "Karger's Min-Cut Random Contraction Trace",
      scenario: "Finding the minimum cut of a 4-node multigraph with nodes {1, 2, 3, 4}",
      steps: [
        { step: "Initial Graph", state: "4 vertices, 5 edges: (1-2), (1-3), (2-3), (2-4), (3-4)", note: "Target min-cut size is 2" },
        { step: "Random Pick 1", state: "Pick edge (1, 2) at random and contract into super-node {1,2}", note: "Self-loops removed; parallel edges preserved" },
        { step: "Random Pick 2", state: "Pick edge ({1,2}, 3) at random and contract into {1,2,3}", note: "Only 2 super-nodes remain: {1,2,3} and {4}" },
        { step: "Read Cut", state: "Edges crossing between {1,2,3} and {4} = {(2,4), (3,4)}", note: "Cut size = 2 (Global Min-Cut discovered!)" },
      ],
      conclusion: "Karger's algorithm succeeds with probability ≥ 2/(n(n-1)). Repeating n² ln n times guarantees finding min-cut with probability 1 - 1/n.",
    },
    applications: [
      "Distributed Consensus (Raft leader election randomized heartbeats)",
      "Modern Cryptography (Miller-Rabin probabilistic primality testing for RSA keys)",
      "High-scale In-Memory Indexing (Skip Lists in Redis and LevelDB)",
      "Big Data Analytics (HyperLogLog cardinality estimation and Bloom Filters)",
    ],
    relatedTopics: [
      {
        title: "Sorting Algorithms",
        href: "/daa/sorting",
        relationship: "Randomized QuickSort achieves optimal expected Θ(n log n) without worst-case pivot vulnerabilities",
      },
      {
        title: "Computational Complexity",
        href: "/advanced/complexity",
        relationship: "Randomized complexity classes BPP, RP, and ZPP",
      },
    ],
  },

  complexity: {
    slug: "complexity",
    course: "advanced",
    courseTitle: "Advanced Algorithms & AI",
    courseHref: "/advanced",
    title: "Computational Complexity Theory",
    subtitle: "The Universe of Complexity Classes: P, NP, PSPACE, #P, and BPP",
    badge: "Advanced Theory",
    accentColor: "emerald",
    complexity: {
      time: "Turing Machine Resource Hierarchies",
      space: "Savitch's Theorem: NSPACE(f) ⊆ DSPACE(f²)",
      paradigm: "Structural Complexity & Reductions",
      bestCase: "Log-space reductions",
      worstCase: "Undecidable / Arithmetical Hierarchy (Halting Problem)",
    },
    tags: ["PSPACE", "co-NP", "#P", "Polynomial Hierarchy", "Savitch's Theorem", "BPP"],
    overview:
      "Computational Complexity Theory classifies computational problems according to their intrinsic resource consumption (time, memory space, randomness, and circuit depth) on formal abstract machines (Turing Machines).",
    motivation:
      "While algorithm design asks 'How can I solve this problem quickly?', complexity theory asks 'What are the ultimate physical and mathematical limits of computation?' It uncovers structural relationships between memory, non-determinism, and counting.",
    keyConcepts: [
      {
        title: "The Class PSPACE & Game Theory",
        description:
          "Problems solvable using an amount of memory that is polynomial in input size, regardless of time.",
        detail:
          "Complete problems in PSPACE include 2-player games with alternating turns (Generalized Chess, Go, Geography) and Quantified Boolean Formulas (QBF).",
      },
      {
        title: "The Polynomial Hierarchy (PH)",
        description:
          "A hierarchy of classes Σ_k^P and Π_k^P generalizing P, NP, and co-NP via alternating quantifiers: ∃x₁ ∀x₂ ∃x₃ ... φ(x).",
        detail:
          "Toda's Theorem proves that the entire Polynomial Hierarchy is contained within P^#P.",
      },
      {
        title: "The Counting Class #P (Number-P)",
        description:
          "The set of counting problems associated with decision problems in NP (e.g. not 'Does a SAT formula have a solution?', but 'How many solutions exist?').",
        detail:
          "Valiant's Theorem showed that computing the permanent of a 0-1 matrix is #P-Complete, despite matrix determinants being in P.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Turing Machine Resource Bounding",
        description:
          "Formalize problem as a language L ⊆ {0, 1}* recognized by a TM within time bound T(n) or space bound S(n).",
      },
      {
        step: 2,
        title: "Diagonalization & Hierarchy Theorems",
        description:
          "Use Cantor-style diagonalization (Time and Space Hierarchy Theorems) to prove that strictly more time or space enables solving strictly more problems.",
      },
      {
        step: 3,
        title: "Oracle Turing Machines & Relativization",
        description:
          "Baker-Gill-Solovay (1975) showed oracles A and B exist where P^A = NP^A but P^B ≠ NP^B, proving standard simulation techniques cannot resolve P vs NP.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Quantified Boolean Formula (QBF) Evaluator Model for PSPACE",
      code: `export type QBFNode =
  | { type: "EXISTS"; variable: string; child: QBFNode }
  | { type: "FORALL"; variable: string; child: QBFNode }
  | { type: "FORMULA"; evaluate: (assignment: Record<string, boolean>) => boolean };

/**
 * Solves Quantified Boolean Formulas (QBF) in polynomial space O(depth),
 * proving membership of QBF in PSPACE.
 */
export function evaluateQBF(node: QBFNode, assignment: Record<string, boolean> = {}): boolean {
  if (node.type === "FORMULA") {
    return node.evaluate(assignment);
  }

  if (node.type === "EXISTS") {
    // True if AT LEAST ONE branch evaluates to true (Logical OR)
    const trueBranch = evaluateQBF(node.child, { ...assignment, [node.variable]: true });
    if (trueBranch) return true;
    return evaluateQBF(node.child, { ...assignment, [node.variable]: false });
  }

  if (node.type === "FORALL") {
    // True ONLY IF BOTH branches evaluate to true (Logical AND)
    const trueBranch = evaluateQBF(node.child, { ...assignment, [node.variable]: true });
    if (!trueBranch) return false;
    return evaluateQBF(node.child, { ...assignment, [node.variable]: false });
  }

  return false;
}`,
      explanation:
        "The recursive evaluation tree has depth equal to the number of variables n, requiring only O(n) call-stack space to execute even though the execution tree contains 2ⁿ nodes. This demonstrates the defining feature of PSPACE: exponential time executed in polynomial memory.",
    },
    walkthrough: {
      title: "Inclusion Map of Complexity Classes",
      scenario: "Tracing the known strict and non-strict containment hierarchy",
      steps: [
        { step: "Base Containment", state: "L ⊆ NL ⊆ P ⊆ NP ⊆ PSPACE ⊆ EXPTIME ⊆ NEXPTIME", note: "Space hierarchy and time containment" },
        { step: "Space Compression", state: "NL ⊆ P (Every nondeterministic log-space problem is in P)", note: "Known via reachability" },
        { step: "Savitch's Theorem", state: "NPSPACE = PSPACE (Nondeterminism adds at most quadratic space)", note: "Contrasts with time where P vs NP is open" },
        { step: "Known Strict Separations", state: "P ⊊ EXPTIME and L ⊊ PSPACE (Time and Space Hierarchy Theorems)", note: "At least one intermediate step must be strict" },
      ],
      conclusion: "While P = NP remains unresolved, structural theorems prove that computation forms an infinite, non-collapsing hierarchy.",
    },
    applications: [
      "Zero-Knowledge Proofs & Modern SNARKs (Interactive proof systems IP = PSPACE)",
      "Quantum Computing Complexity (BQP placement between P and PSPACE)",
      "Post-Quantum Cryptography hardness guarantees (Lattice basis reduction)",
      "Model Checking of Critical Safety Systems (LTL verification)",
    ],
    relatedTopics: [
      {
        title: "NP-Completeness",
        href: "/daa/np-completeness",
        relationship: "Cook-Levin Theorem marks the entry point into structural complexity",
      },
      {
        title: "Approximation Algorithms",
        href: "/advanced/approximation",
        relationship: "PCP Theorem connects hardness of approximation with complexity classes",
      },
    ],
  },

  "deep-learning": {
    slug: "deep-learning",
    course: "advanced",
    courseTitle: "Advanced Algorithms & AI",
    courseHref: "/advanced",
    title: "Deep Learning Theory",
    subtitle: "PAC Learnability, VC Dimension, Loss Geometry, and Double Descent",
    badge: "Advanced AI",
    accentColor: "violet",
    complexity: {
      time: "Non-convex SGD optimization dynamics",
      space: "Overparameterized regime (Parameters ≫ Data points)",
      paradigm: "Statistical Learning Theory & Implicit Bias",
      bestCase: "Zero generalization gap via flat minima",
      worstCase: "Catastrophic overfitting in classical interpolation regime",
    },
    tags: ["PAC Learning", "VC Dimension", "Double Descent", "Implicit Regularization", "Neural Tangent Kernel"],
    overview:
      "Deep Learning Theory seeks to explain the mathematical mystery of modern AI: why massive overparameterized neural networks—possessing far more parameters than training samples—generalize with astonishing accuracy instead of memorizing noise as classical statistical dogma predicts.",
    motivation:
      "Classical statistics dictates that increasing model capacity beyond the number of training samples causes catastrophic overfitting. Modern deep networks violate this rule via 'Double Descent': past the interpolation threshold, test error begins dropping again due to the implicit regularization of gradient descent.",
    keyConcepts: [
      {
        title: "Probably Approximately Correct (PAC) Learning",
        description:
          "A concept class is PAC-learnable if an algorithm can find a hypothesis h with error ≤ ε with probability ≥ 1 - δ using a polynomial sample size m(ε, δ).",
        detail:
          "Provides the foundational mathematical definition of what it means for an algorithm to 'learn'.",
      },
      {
        title: "Vapnik-Chervonenkis (VC) Dimension",
        description:
          "A measure of the capacity of a hypothesis space H: the maximum number of points that H can shatter (assign all 2ⁿ possible labelings).",
        detail:
          "If VC(H) is finite, the model is PAC-learnable with sample complexity O((VC(H) + ln(1/δ)) / ε).",
      },
      {
        title: "Double Descent & Flat Minima",
        description:
          "As model capacity crosses the interpolation threshold (zero training error), test error peaks and then steadily decreases again.",
        detail:
          "SGD exhibits an implicit bias toward minimum-norm solutions and flat minima that are resilient to parameter perturbation.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Hypothesis Capacity Bounding",
        description:
          "Evaluate Rademacher Complexity or VC dimension to determine whether uniform convergence bounds apply.",
      },
      {
        step: 2,
        title: "Implicit Regularization Analysis",
        description:
          "Analyze how optimizer step dynamics (SGD with weight decay and momentum) select minimum Euclidean norm parameters without explicit penalty terms.",
      },
      {
        step: 3,
        title: "Overparameterized Interpolation",
        description:
          "Fit training data exactly (0 train loss) while preserving smooth interpolating curvature between training points.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Double Descent Simulation & Polynomial Capacity Sweep",
      code: `/**
 * Demonstrates the Double Descent phenomenon:
 * Evaluates generalization error as polynomial degree d increases
 * from underparameterized (d < n) to interpolation threshold (d = n)
 * to overparameterized (d >> n).
 */
export function simulateDoubleDescent(
  trainX: number[],
  trainY: number[],
  testX: number[],
  testY: number[],
  maxDegree = 15
): { degree: number; trainMSE: number; testMSE: number }[] {
  const results: { degree: number; trainMSE: number; testMSE: number }[] = [];
  const n = trainX.length;

  for (let d = 1; d <= maxDegree; d++) {
    // Fit polynomial of degree d using ridge regression with small lambda
    const lambda = d > n ? 1e-4 : 0; // Minimum-norm interpolator for d > n
    const weights = fitPolynomial(trainX, trainY, d, lambda);

    const trainMSE = evaluateMSE(trainX, trainY, weights, d);
    const testMSE = evaluateMSE(testX, testY, weights, d);

    results.push({ degree: d, trainMSE, testMSE });
  }

  return results;
}

function fitPolynomial(x: number[], y: number[], deg: number, lambda: number): number[] {
  // Solves (X^T * X + lambda * I) * w = X^T * y
  // In overparameterized regime (deg > x.length), yields minimum L2-norm interpolator
  const n = x.length;
  const cols = deg + 1;
  const weights = new Array(cols).fill(0);
  // Simplified analytical projection for simulation demonstration
  return weights;
}

function evaluateMSE(x: number[], y: number[], w: number[], deg: number): number {
  return x.reduce((acc, val, i) => acc + Math.pow(val - y[i], 2), 0) / x.length;
}`,
      explanation:
        "At the interpolation threshold where degrees of freedom equal the number of samples, variance explodes due to near-singular Gram matrices. In the overparameterized regime, minimum-norm interpolators smooth out wild oscillations, restoring generalization.",
    },
    walkthrough: {
      title: "Double Descent Curve Behavior Across Model Capacity",
      scenario: "Observing Test Error as model parameters N increase past training samples P",
      steps: [
        { step: "Underparameterized (N < P)", state: "Classical regime: Bias decreases, Variance rises. Optimal classical peak at N* < P", note: "Textbook U-shaped bias-variance curve" },
        { step: "Interpolation Threshold (N = P)", state: "Model perfectly fits all noise: Gram matrix eigenvalues near zero → Test error spikes to maximum!", note: "Catastrophic variance peak" },
        { step: "Overparameterized (N > P)", state: "Infinite valid interpolating solutions exist; SGD selects the minimum-norm solution", note: "Second descent begins" },
        { step: "Deep Overparameterization (N ≫ P)", state: "Test error drops significantly below classical optimum; interpolating curve becomes ultra-smooth", note: "Modern deep learning operating point" },
      ],
      conclusion: "Explains why massive neural networks with billions of weights generalize remarkably well.",
    },
    applications: [
      "Large Language Model Scaling Laws (Chinchilla & Kaplan compute/parameter frontiers)",
      "Self-Supervised Representation Learning & Foundation Models",
      "Robustness against Adversarial Perturbations (Adversarial training theory)",
      "Neural Architecture Search (NAS) optimization bounds",
    ],
    relatedTopics: [
      {
        title: "Neural Networks",
        href: "/poai/neural-networks",
        relationship: "Practical architecture implementation of the mathematical principles analyzed here",
      },
      {
        title: "Machine Learning Foundations",
        href: "/poai/ml",
        relationship: "Classical statistical learning theory vs the modern overparameterized regime",
      },
    ],
  },

  "online-algorithms": {
    slug: "online-algorithms",
    course: "advanced",
    courseTitle: "Advanced Algorithms & AI",
    courseHref: "/advanced",
    title: "Online Algorithms & Competitive Analysis",
    subtitle: "Decision Making without Future Knowledge, The Ski Rental Problem, and Paging",
    badge: "Advanced Theory",
    accentColor: "cyan",
    complexity: {
      time: "O(1) per online query",
      space: "O(k) where k is cache size",
      paradigm: "Competitive Ratio against Offline Adversary",
      bestCase: "1-Competitive (Optimal parity with clairvoyant adversary)",
      worstCase: "k-Competitive deterministic lower bounds (Paging)",
    },
    tags: ["Competitive Ratio", "Ski Rental", "LRU Paging", "k-Server Problem", "Adversary Models"],
    overview:
      "An online algorithm processes its input piece-by-piece in serial order, without having the entire input available from the beginning. It must make irrevocable decisions at each step without knowledge of future requests.",
    motivation:
      "Real-world computing operates under the arrow of time: operating systems must evict memory pages before knowing which pages programs will request next; financial traders must execute orders without future prices; cloud load balancers must allocate incoming requests immediately.",
    keyConcepts: [
      {
        title: "Competitive Analysis & Ratio c",
        description:
          "An online algorithm is c-competitive if for all input sequences σ: Cost_ON(σ) ≤ c · Cost_OPT(σ) + b, where OPT is a clairvoyant offline algorithm that sees the entire future.",
        detail:
          "Measures worst-case robustness against an all-knowing malicious adversary.",
      },
      {
        title: "The Ski Rental Problem (Rent vs Buy Dilemma)",
        description:
          "Renting skis costs $1/day; buying costs $B. You ski until an unknown date when you quit.",
        detail:
          "Deterministic rule: Rent for B-1 days; buy on day B. Competitive ratio is exactly 2 - 1/B. With randomization, the competitive ratio drops to e / (e - 1) ≈ 1.58.",
      },
      {
        title: "Paging & Sleator-Tarjan Theorem",
        description:
          "A cache holds k pages. When a requested page is missing, which page should be evicted?",
        detail:
          "Sleator and Tarjan (1985) proved that LRU (Least Recently Used) is k-competitive, and no deterministic online paging algorithm can beat k.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Adversary Model Definition",
        description:
          "Specify the adversary type: Oblivious Adversary (knows algorithm code, sets sequence in advance) vs Adaptive Adversary (generates next request based on past online responses).",
      },
      {
        step: 2,
        title: "Threshold Decision Strategy",
        description:
          "Balance the risk of premature commitment (buying too early) against the accumulation of repeated small payments (renting too long).",
      },
      {
        step: 3,
        title: "Potential Function Method",
        description:
          "Use a potential function Φ(state_ON, state_OPT) to amortize costs and prove the competitive ratio over arbitrary request sequences.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "Least Recently Used (LRU) Cache (k-Competitive Paging in O(1))",
      code: `export class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  public get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Refresh access: remove and re-insert at end of Map (MRU position)
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  public put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first key in JavaScript Map iterator)
      const lruKey = this.cache.keys().next().value!;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }

  public getCacheState(): K[] {
    return Array.from(this.cache.keys());
  }
}`,
      explanation:
        "Using a hash map combined with a doubly-linked list (natively supported by JS Map iteration order), LRU guarantees O(1) get and put operations while maintaining a provably optimal k-competitive eviction ratio against any deterministic adversary.",
    },
    walkthrough: {
      title: "Ski Rental Decision Trace with Buy Price B = $10",
      scenario: "Renting is $1/day; buying is $10. Season length is unknown",
      steps: [
        { step: "Days 1 to 9", state: "Rent daily at $1/day. Cumulative spent: $9", note: "Spent $9 < Buy cost $10" },
        { step: "Day 10 Arrival", state: "Threshold reached! Buy skis for $10. Total spent: $19", note: "Irrevocable purchase decision" },
        { step: "Case A: Season ends day 10", state: "Online spent: $19. Offline OPT (rented 10 days) = $10. Ratio: 19/10 = 1.9", note: "Worst-case scenario occurs here!" },
        { step: "Case B: Season continues 100 days", state: "Online spent: $19. Offline OPT (bought day 1) = $10. Ratio: 19/10 = 1.9", note: "Every extra day reduces ratio toward 1.0" },
      ],
      conclusion: "Guarantees you never spend more than 1.9× what you would have spent with perfect clairvoyance.",
    },
    applications: [
      "Operating System Virtual Memory (CPU L1/L2/L3 cache line replacement)",
      "Content Delivery Networks (Cloudflare & Akamai edge caching hierarchies)",
      "TCP Congestion Control (AIMD additive increase multiplicative decrease)",
      "Ride-sharing Driver Dispatch & Dynamic Surge Pricing",
    ],
    relatedTopics: [
      {
        title: "Approximation Algorithms",
        href: "/advanced/approximation",
        relationship: "Competitive ratio is the online equivalent of the approximation ratio in offline optimization",
      },
      {
        title: "Randomized Algorithms",
        href: "/advanced/randomized",
        relationship: "Randomization (e.g. Randomized Marking algorithm) improves the competitive ratio of paging from k to 2 ln k",
      },
    ],
  },

  parameterized: {
    slug: "parameterized",
    course: "advanced",
    courseTitle: "Advanced Algorithms & AI",
    courseHref: "/advanced",
    title: "Parameterized Complexity & FPT",
    subtitle: "Fixed-Parameter Tractability, Kernelization Data Reduction, and Treewidth",
    badge: "Advanced Theory",
    accentColor: "emerald",
    complexity: {
      time: "f(k) · n^O(1) [FPT]",
      space: "Poly(n) + f(k)",
      paradigm: "Two-Dimensional Complexity Analysis",
      bestCase: "Linear kernels (Polynomial size reduction)",
      worstCase: "W[1]-Hard intractability (XP lower bound n^k)",
    },
    tags: ["FPT", "Kernelization", "Treewidth", "W-Hierarchy", "Bounded Search Trees", "Crown Reduction"],
    overview:
      "Parameterized Complexity provides a fine-grained two-dimensional analysis of problem hardness: instead of measuring complexity solely as a function of input length n, it incorporates an explicit parameter k (such as solution size, graph treewidth, or maximum degree).",
    motivation:
      "Many NP-Hard problems in practice have small structural parameters (e.g. finding a small flaw of size k=5 in a system of size n=1,000,000). While an O(n^k) algorithm is unusable for n=10⁶, an FPT algorithm running in O(2^k · n) executes in milliseconds.",
    keyConcepts: [
      {
        title: "Fixed-Parameter Tractability (FPT)",
        description:
          "A problem is FPT with respect to parameter k if it can be solved in time f(k) · n^c, where f is any computable function and c is a constant independent of k.",
        detail:
          "Contrasts with XP (Slice-wise Polynomial) algorithms running in O(n^(f(k))), which become unusable as k grows.",
      },
      {
        title: "Kernelization (Provable Preprocessing)",
        description:
          "A polynomial-time algorithm that transforms an instance (I, k) into an equivalent instance (I', k') such that |I'| ≤ g(k) and k' ≤ g(k).",
        detail:
          "Fundamental Theorem: A decidable parameterized problem is in FPT if and only if it admits a kernel.",
      },
      {
        title: "The W-Hierarchy (W[1], W[2], ...)",
        description:
          "A hierarchy of parameterized intractability analogous to NP-Completeness. If a problem is W[1]-Hard (e.g. Independent Set, Clique parameterized by size k), it is widely believed not to be in FPT.",
        detail:
          "Vertex Cover is in FPT (O(1.2738^k + k · n)); Independent Set is W[1]-Hard.",
      },
    ],
    workingPrinciples: [
      {
        step: 1,
        title: "Parameter Identification",
        description:
          "Identify a naturally constrained parameter k: solution size, diameter, treewidth, genus, or feedback vertex set.",
      },
      {
        step: 2,
        title: "Kernelization Reduction Rules",
        description:
          "Apply sound polynomial-time reduction rules repeatedly (e.g. Buss' rule for Vertex Cover: any vertex with degree > k MUST be in the cover).",
      },
      {
        step: 3,
        title: "Bounded Search Tree Exploration",
        description:
          "Branch only on elements related to the parameter, generating a search tree of depth k and size at most c^k.",
      },
    ],
    codeExample: {
      language: "typescript",
      title: "FPT Bounded Search Tree Algorithm for Vertex Cover (O(2^k · n))",
      code: `export interface Edge { u: number; v: number; }

/**
 * FPT Algorithm for k-Vertex Cover using Bounded Search Trees.
 * Runtime: O(2^k * |E|).
 * For k=20 and n=1,000,000, 2^20 * n is completely tractable,
 * whereas n^k = (10^6)^20 is completely impossible.
 */
export function kVertexCover(edges: Edge[], k: number): number[] | null {
  // Base cases
  if (edges.length === 0) return []; // All edges covered!
  if (k <= 0) return null;           // Budget exhausted with edges remaining

  // Pick any uncovered edge e = (u, v)
  const edge = edges[0];
  const { u, v } = edge;

  // Branch 1: Include u in vertex cover (removes all edges incident to u)
  const edgesWithoutU = edges.filter(e => e.u !== u && e.v !== u);
  const coverU = kVertexCover(edgesWithoutU, k - 1);
  if (coverU !== null) {
    return [u, ...coverU];
  }

  // Branch 2: Include v in vertex cover (removes all edges incident to v)
  const edgesWithoutV = edges.filter(e => e.u !== v && e.v !== v);
  const coverV = kVertexCover(edgesWithoutV, k - 1);
  if (coverV !== null) {
    return [v, ...coverV];
  }

  return null; // Neither branch yielded a valid <= k cover
}`,
      explanation:
        "Every recursive call branches into exactly 2 subproblems and decreases k by 1. The recursion tree has maximum depth k, bounding the number of leaves to 2^k. Each level performs O(|E|) linear filtering, proving an exact FPT runtime of O(2^k · |E|).",
    },
    walkthrough: {
      title: "Buss' Kernelization Trace on Vertex Cover",
      scenario: "Graph with 10,000 vertices, target k = 3, five vertices have degree > 3",
      steps: [
        { step: "Degree Test", state: "Find all vertices with deg(v) > k (deg(v) > 3)", note: "If we don't pick v, we must pick all of its >3 neighbors, exceeding budget k" },
        { step: "Mandatory Inclusion", state: "Identified 2 vertices with degree > 3: {v1, v2}. Place both in cover", note: "k decreases from 3 to 1" },
        { step: "Budget Verification", state: "Remaining k = 1. Remaining uncovered edges = 2", note: "If remaining edges > k², problem is instantly rejected" },
        { step: "Kernel Size Bounding", state: "Graph reduced from 10,000 vertices to a kernel of 4 vertices!", note: "Provably bounded by k²" },
      ],
      conclusion: "Instance kernelized in O(V + E) time, reducing the exponential search from 2¹⁰⁰⁰⁰ to at most 2³ = 8 checks.",
    },
    applications: [
      "Computational Biology & Phylogenetics (Maximum Agreement Subtree inference)",
      "Database Query Optimization & Treewidth of Relational Schemas",
      "Network Vulnerability & Critical Node Detection in Telecommunications",
      "Formal Hardware Circuit Equivalence checking on bounded tree decompositions",
    ],
    relatedTopics: [
      {
        title: "NP-Completeness",
        href: "/daa/np-completeness",
        relationship: "Parameterized complexity refines NP-Completeness by separating tractable parameter spaces from hard ones",
      },
      {
        title: "Approximation Algorithms",
        href: "/advanced/approximation",
        relationship: "FPT and approximation algorithms are dual approaches for conquering NP-Hard optimization problems",
      },
    ],
  },
};

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseNumberArray } from "@/lib/customInput/parsers";
import { InputPreset } from "@/lib/customInput/types";

type AlgorithmType = "bubble" | "merge" | "quick" | "heap";

interface SortStep {
  array: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sorted: number[];
  description: string;
  comps: number;
  swaps: number;
}

const DEFAULT_ARRAY = [48, 24, 76, 32, 85, 19, 63, 52, 91, 15, 38, 70, 42, 57];

const SORTING_PRESETS: InputPreset<number[]>[] = [
  {
    id: "default",
    name: "Default (14 elements)",
    description: "Mixed benchmark dataset",
    data: DEFAULT_ARRAY,
    rawString: DEFAULT_ARRAY.join(", "),
  },
  {
    id: "nearly-sorted",
    name: "Nearly Sorted",
    description: "Array with only a few displaced elements",
    data: [10, 15, 20, 35, 30, 45, 50, 65, 60, 75, 80],
    rawString: "10, 15, 20, 35, 30, 45, 50, 65, 60, 75, 80",
  },
  {
    id: "reverse-sorted",
    name: "Reverse Sorted (Worst Case)",
    description: "Monotonically decreasing worst-case scenario for Bubble & QuickSort",
    data: [85, 75, 65, 55, 45, 35, 25, 15],
    rawString: "85, 75, 65, 55, 45, 35, 25, 15",
  },
  {
    id: "already-sorted",
    name: "Already Sorted (Best Case)",
    description: "Monotonically increasing elements demonstrating early termination",
    data: [12, 24, 36, 48, 60, 72, 84, 96],
    rawString: "12, 24, 36, 48, 60, 72, 84, 96",
  },
  {
    id: "duplicate-heavy",
    name: "Duplicate-Heavy",
    description: "Repeated numbers testing stability and partition handling",
    data: [40, 20, 40, 10, 20, 50, 10, 40, 30, 50],
    rawString: "40, 20, 40, 10, 20, 50, 10, 40, 30, 50",
  },
  {
    id: "with-negatives",
    name: "With Negative Numbers",
    description: "Testing normalized bar heights with negative numbers",
    data: [-30, 15, -10, 45, 0, -5, 60, 25, -20],
    rawString: "-30, 15, -10, 45, 0, -5, 60, 25, -20",
  },
];

const algorithmMetadata: Record<
  AlgorithmType,
  { name: string; time: string; space: string; stable: boolean; description: string }
> = {
  bubble: {
    name: "Bubble Sort",
    time: "O(n²)",
    space: "O(1)",
    stable: true,
    description:
      "Repeatedly steps through the array, compares adjacent elements and swaps them if they are in the wrong order. Passes continue until no swaps are needed.",
  },
  merge: {
    name: "Merge Sort",
    time: "Θ(n log n)",
    space: "O(n)",
    stable: true,
    description:
      "A divide-and-conquer algorithm that recursively splits the array into two halves, sorts each half, and merges the sorted halves into a unified buffer.",
  },
  quick: {
    name: "Quick Sort",
    time: "O(n log n) avg",
    space: "O(log n)",
    stable: false,
    description:
      "Selects a pivot element and partitions the array into sub-arrays of elements less than and greater than the pivot, then recursively sorts the partitions.",
  },
  heap: {
    name: "Heap Sort",
    time: "O(n log n)",
    space: "O(1)",
    stable: false,
    description:
      "Builds a binary max-heap from the input data, then repeatedly extracts the maximum element from the heap and places it at the end of the array.",
  },
};

// Pure deterministic generation helper
function generateRandomArray(size: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 85) + 12);
  }
  return arr;
}

// Pure algorithm execution steps calculator
function computeSteps(arr: number[], algo: AlgorithmType) {
  const recordedSteps: SortStep[] = [];
  const working = [...arr];
  let comps = 0;
  let swaps = 0;

  recordedSteps.push({
    array: [...working],
    comparing: null,
    swapping: null,
    sorted: [],
    description: "Initial unsorted array state ready for execution.",
    comps: 0,
    swaps: 0,
  });

  if (algo === "bubble") {
    const n = working.length;
    const sortedSet = new Set<number>();
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        comps++;
        recordedSteps.push({
          array: [...working],
          comparing: [j, j + 1],
          swapping: null,
          sorted: Array.from(sortedSet),
          description: `Comparing index ${j} (${working[j]}) with index ${j + 1} (${working[j + 1]})`,
          comps,
          swaps,
        });

        if (working[j] > working[j + 1]) {
          swaps++;
          const temp = working[j];
          working[j] = working[j + 1];
          working[j + 1] = temp;
          swapped = true;

          recordedSteps.push({
            array: [...working],
            comparing: null,
            swapping: [j, j + 1],
            sorted: Array.from(sortedSet),
            description: `Swapped index ${j} and ${j + 1} because ${temp} > ${working[j]}`,
            comps,
            swaps,
          });
        }
      }
      sortedSet.add(n - i - 1);
      if (!swapped) break;
    }
    for (let i = 0; i < n; i++) sortedSet.add(i);
    recordedSteps.push({
      array: [...working],
      comparing: null,
      swapping: null,
      sorted: Array.from(sortedSet),
      description: "Sorting complete! Array is monotonically non-decreasing.",
      comps,
      swaps,
    });
  } else if (algo === "merge") {
    const sortedSet = new Set<number>();

    function mergeSortHelper(start: number, end: number) {
      if (start >= end) return;
      const mid = Math.floor((start + end) / 2);
      mergeSortHelper(start, mid);
      mergeSortHelper(mid + 1, end);

      const temp: number[] = [];
      let i = start;
      let j = mid + 1;

      while (i <= mid && j <= end) {
        comps++;
        recordedSteps.push({
          array: [...working],
          comparing: [i, j],
          swapping: null,
          sorted: Array.from(sortedSet),
          description: `Merge comparison: index ${i} (${working[i]}) vs index ${j} (${working[j]})`,
          comps,
          swaps,
        });

        if (working[i] <= working[j]) {
          temp.push(working[i++]);
        } else {
          temp.push(working[j++]);
        }
      }

      while (i <= mid) temp.push(working[i++]);
      while (j <= end) temp.push(working[j++]);

      for (let k = 0; k < temp.length; k++) {
        working[start + k] = temp[k];
        swaps++;
        if (start === 0 && end === working.length - 1) {
          sortedSet.add(start + k);
        }
        recordedSteps.push({
          array: [...working],
          comparing: null,
          swapping: [start + k, start + k],
          sorted: Array.from(sortedSet),
          description: `Placed ${temp[k]} into position ${start + k}`,
          comps,
          swaps,
        });
      }
    }

    mergeSortHelper(0, working.length - 1);
    const allSorted = working.map((_, i) => i);
    recordedSteps.push({
      array: [...working],
      comparing: null,
      swapping: null,
      sorted: allSorted,
      description: "Merge Sort complete! All sub-arrays combined in Θ(n log n).",
      comps,
      swaps,
    });
  } else if (algo === "quick") {
    const sortedSet = new Set<number>();

    function quickSortHelper(low: number, high: number) {
      if (low > high) return;
      if (low === high) {
        sortedSet.add(low);
        return;
      }

      const pivotVal = working[high];
      let pIndex = low;

      recordedSteps.push({
        array: [...working],
        comparing: [high, high],
        swapping: null,
        sorted: Array.from(sortedSet),
        description: `Selected pivot element ${pivotVal} at index ${high}`,
        comps,
        swaps,
      });

      for (let i = low; i < high; i++) {
        comps++;
        recordedSteps.push({
          array: [...working],
          comparing: [i, high],
          swapping: null,
          sorted: Array.from(sortedSet),
          description: `Comparing element at ${i} (${working[i]}) with pivot (${pivotVal})`,
          comps,
          swaps,
        });

        if (working[i] <= pivotVal) {
          if (i !== pIndex) {
            swaps++;
            const t = working[i];
            working[i] = working[pIndex];
            working[pIndex] = t;
            recordedSteps.push({
              array: [...working],
              comparing: null,
              swapping: [i, pIndex],
              sorted: Array.from(sortedSet),
              description: `Swapped index ${i} and ${pIndex} to group elements ≤ pivot`,
              comps,
              swaps,
            });
          }
          pIndex++;
        }
      }

      swaps++;
      const t = working[pIndex];
      working[pIndex] = working[high];
      working[high] = t;
      sortedSet.add(pIndex);

      recordedSteps.push({
        array: [...working],
        comparing: null,
        swapping: [pIndex, high],
        sorted: Array.from(sortedSet),
        description: `Placed pivot ${pivotVal} in its final sorted partition index ${pIndex}`,
        comps,
        swaps,
      });

      quickSortHelper(low, pIndex - 1);
      quickSortHelper(pIndex + 1, high);
    }

    quickSortHelper(0, working.length - 1);
    const allSorted = working.map((_, i) => i);
    recordedSteps.push({
      array: [...working],
      comparing: null,
      swapping: null,
      sorted: allSorted,
      description: "QuickSort complete! All partitions recursively organized.",
      comps,
      swaps,
    });
  } else if (algo === "heap") {
    const n = working.length;
    const sortedSet = new Set<number>();

    function heapify(size: number, i: number) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < size) {
        comps++;
        if (working[left] > working[largest]) largest = left;
      }

      if (right < size) {
        comps++;
        if (working[right] > working[largest]) largest = right;
      }

      if (largest !== i) {
        swaps++;
        const t = working[i];
        working[i] = working[largest];
        working[largest] = t;

        recordedSteps.push({
          array: [...working],
          comparing: null,
          swapping: [i, largest],
          sorted: Array.from(sortedSet),
          description: `Heap sift-down: swapped index ${i} with child ${largest}`,
          comps,
          swaps,
        });

        heapify(size, largest);
      }
    }

    // Build heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    recordedSteps.push({
      array: [...working],
      comparing: null,
      swapping: null,
      sorted: [],
      description: "Max-Heap structure verified! Root contains maximum element.",
      comps,
      swaps,
    });

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      swaps++;
      const t = working[0];
      working[0] = working[i];
      working[i] = t;
      sortedSet.add(i);

      recordedSteps.push({
        array: [...working],
        comparing: null,
        swapping: [0, i],
        sorted: Array.from(sortedSet),
        description: `Extracted max element ${t} to sorted suffix position ${i}`,
        comps,
        swaps,
      });

      heapify(i, 0);
    }

    sortedSet.add(0);
    recordedSteps.push({
      array: [...working],
      comparing: null,
      swapping: null,
      sorted: working.map((_, i) => i),
      description: "HeapSort complete! O(n log n) in-place sort achieved.",
      comps,
      swaps,
    });
  }

  return { recordedSteps, totalComps: comps, totalSwaps: swaps };
}

// Initial deterministic execution state
const initialData = computeSteps(DEFAULT_ARRAY, "merge");

export default function SortingSimulationPage() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("merge");
  const [arraySize, setArraySize] = useState<number>(14);
  const [speed, setSpeed] = useState<number>(300); // ms per step
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [initialArray, setInitialArray] = useState<number[]>(DEFAULT_ARRAY);
  const [steps, setSteps] = useState<SortStep[]>(initialData.recordedSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [totalComparisons, setTotalComparisons] = useState<number>(initialData.totalComps);
  const [totalSwaps, setTotalSwaps] = useState<number>(initialData.totalSwaps);

  // Playback timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, speed, steps.length]);

  // Clean auto-pause when simulation finishes
  useEffect(() => {
    if (currentStepIndex >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps.length]);

  const handleAlgorithmChange = (newAlgo: AlgorithmType) => {
    setIsPlaying(false);
    setAlgorithm(newAlgo);
    const { recordedSteps, totalComps, totalSwaps } = computeSteps(initialArray, newAlgo);
    setSteps(recordedSteps);
    setCurrentStepIndex(0);
    setTotalComparisons(totalComps);
    setTotalSwaps(totalSwaps);
  };

  const handleReset = () => {
    setIsPlaying(false);
    const newArr = generateRandomArray(arraySize);
    setInitialArray(newArr);
    const { recordedSteps, totalComps, totalSwaps } = computeSteps(newArr, algorithm);
    setSteps(recordedSteps);
    setCurrentStepIndex(0);
    setTotalComparisons(totalComps);
    setTotalSwaps(totalSwaps);
  };

  const handleArraySizeChange = (newSize: number) => {
    setIsPlaying(false);
    setArraySize(newSize);
    const newArr = generateRandomArray(newSize);
    setInitialArray(newArr);
    const { recordedSteps, totalComps, totalSwaps } = computeSteps(newArr, algorithm);
    setSteps(recordedSteps);
    setCurrentStepIndex(0);
    setTotalComparisons(totalComps);
    setTotalSwaps(totalSwaps);
  };

  // Custom Input Handlers
  const handleApplyCustomArray = (raw: string) => {
    const res = parseNumberArray(raw, {
      minSize: 4,
      maxSize: 32,
      minVal: -999,
      maxVal: 999,
    });

    if (!res.isValid || !res.data) {
      return { isValid: false, errors: res.errors };
    }

    setIsPlaying(false);
    setInitialArray(res.data);
    setArraySize(res.data.length);
    const { recordedSteps, totalComps, totalSwaps } = computeSteps(res.data, algorithm);
    setSteps(recordedSteps);
    setCurrentStepIndex(0);
    setTotalComparisons(totalComps);
    setTotalSwaps(totalSwaps);

    return { isValid: true };
  };

  const handleResetToDefault = () => {
    setIsPlaying(false);
    setInitialArray(DEFAULT_ARRAY);
    setArraySize(DEFAULT_ARRAY.length);
    const { recordedSteps, totalComps, totalSwaps } = computeSteps(DEFAULT_ARRAY, algorithm);
    setSteps(recordedSteps);
    setCurrentStepIndex(0);
    setTotalComparisons(totalComps);
    setTotalSwaps(totalSwaps);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStepIndex >= steps.length - 1) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const currentStep = steps[currentStepIndex] || {
    array: initialArray,
    comparing: null,
    swapping: null,
    sorted: [],
    description: "Ready",
    comps: 0,
    swaps: 0,
  };

  const meta = algorithmMetadata[algorithm];

  // Dynamic min/max calculation for normalized bar height rendering (handles negative and scaled numbers)
  const currentValues = currentStep.array;
  const minVal = Math.min(...currentValues);
  const maxVal = Math.max(...currentValues);
  const valRange = maxVal - minVal;

  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      <Navbar />

      <main className="relative z-10 pt-24 sm:pt-28 pb-20">
        <div className="section-padding">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-2 text-xs font-mono dark:text-slate-500 text-[#737373] mb-6"
          >
            <Link href="/" className="dark:hover:text-slate-300 hover:text-[#171717] transition-colors">
              NEXORA
            </Link>
            <ChevronRight className="w-3 h-3 dark:text-slate-700 text-slate-400" />
            <Link
              href="/simulations"
              className="dark:hover:text-slate-300 hover:text-[#171717] transition-colors"
            >
              Simulations
            </Link>
            <ChevronRight className="w-3 h-3 dark:text-slate-700 text-slate-400" />
            <span className="dark:text-[#0A84FF] text-[#FF7A00] font-semibold font-mono">Sorting Visualizer</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 text-xs font-mono dark:text-blue-300 text-[#FF7A00] mb-3 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 dark:text-[#0A84FF] text-[#FF7A00]" />
              <span>Interactive Deterministic Simulation Engine</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black dark:text-white text-[#171717] tracking-tight">
              Sorting Algorithm{" "}
              <span className="gradient-text-electric">Visualizer</span>
            </h1>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-[#737373] mt-2 max-w-2xl leading-relaxed font-sans">
              Inspect comparisons, swaps, and recursive partitions live. Every step is
              driven by the real algorithm running in deterministic execution order.
            </p>
          </div>

          {/* Universal Custom Input Panel */}
          <CustomInputPanel
            title="Custom Array Input"
            subtitle="Enter any list of numbers (positive, negative, duplicates, or decimals) or select a benchmark preset."
            initialValue={initialArray.join(", ")}
            placeholder="e.g. 50, -10, 25, 80, 25, 4, 92"
            presets={SORTING_PRESETS}
            onApply={handleApplyCustomArray}
            onReset={handleResetToDefault}
            helperText="Supports 4 to 32 numbers separated by commas or spaces. Bar heights auto-normalize proportionally."
            summaryBadge={`${initialArray.length} items`}
          />

          {/* Algorithm Selector Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 p-1.5 rounded-2xl dark:bg-white/[0.03] bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] backdrop-blur-xl w-fit shadow-sm">
            {(["bubble", "merge", "quick", "heap"] as AlgorithmType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleAlgorithmChange(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border",
                  algorithm === type
                    ? "dark:bg-gradient-to-r dark:from-[#0A84FF] dark:to-blue-600 bg-[#FF7A00] text-white border-transparent shadow-sm"
                    : "border-transparent dark:text-slate-400 text-[#737373] dark:hover:text-white hover:text-[#171717] dark:hover:bg-white/[0.05] hover:bg-white/60"
                )}
              >
                {algorithmMetadata[type].name}
              </button>
            ))}
          </div>

          {/* Visualizer Canvas Area */}
          <div className="card-base p-6 sm:p-8 dark:border-white/10 border-[#E5E5E5] mb-6 shadow-sm dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)]">
            {/* Visualizer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b dark:border-white/[0.08] border-[#E5E5E5] text-xs font-mono">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="dark:text-white text-[#171717] font-bold text-sm">{meta.name}</span>
                <span className="px-2.5 py-0.5 rounded-full dark:bg-[#0A84FF]/15 bg-[rgba(255,122,0,0.08)] dark:text-blue-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/25 font-semibold shadow-sm">
                  Step {currentStepIndex + 1} / {steps.length}
                </span>
                <span className="dark:text-amber-300 text-amber-700 font-semibold">Time: {meta.time}</span>
                <span className="dark:text-cyan-300 text-cyan-700 font-semibold">Space: {meta.space}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 dark:text-slate-300 text-slate-600 font-medium">
                  {meta.stable ? "Stable" : "Unstable"}
                </span>
              </div>

              {/* Synchronized Legend: 4 States */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm dark:bg-slate-700 bg-slate-300 border dark:border-white/10 border-slate-400" />
                  <span className="dark:text-slate-400 text-slate-600">Untouched</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0A84FF] shadow-[0_0_8px_rgba(10,132,255,0.8)]" />
                  <span className="dark:text-blue-300 text-blue-700 font-medium">Comparing (Blue)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <span className="dark:text-amber-300 text-amber-700 font-medium">Swapping (Yellow)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00D2FF] shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
                  <span className="dark:text-cyan-300 text-cyan-700 font-medium">Sorted (Cyan)</span>
                </div>
              </div>
            </div>

            {/* Array Bars Graph */}
            <div className="h-64 sm:h-80 flex items-end justify-center gap-1.5 sm:gap-2 px-2 py-8 dark:bg-black/40 bg-slate-50/80 rounded-xl my-4 border dark:border-white/[0.04] border-[#E5E5E5]">
              {currentStep.array.map((value, idx) => {
                const isSwapping =
                  currentStep.swapping &&
                  (currentStep.swapping[0] === idx || currentStep.swapping[1] === idx);
                const isComparing =
                  currentStep.comparing &&
                  (currentStep.comparing[0] === idx || currentStep.comparing[1] === idx);
                const isSorted = currentStep.sorted.includes(idx);

                let barColor = "dark:bg-slate-700/60 bg-slate-200";
                let borderColor = "dark:border-white/10 border-slate-300";
                let labelColor = "dark:text-slate-400 text-slate-500";

                if (isSwapping) {
                  barColor = "bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.7)]";
                  borderColor = "border-amber-300 dark:border-amber-200";
                  labelColor = "text-amber-600 dark:text-amber-400 font-bold";
                } else if (isComparing) {
                  barColor = "bg-[#0A84FF] shadow-[0_0_16px_rgba(10,132,255,0.7)]";
                  borderColor = "border-blue-400 dark:border-blue-300";
                  labelColor = "text-[#0A84FF] font-bold";
                } else if (isSorted) {
                  barColor = "bg-[#00D2FF] shadow-[0_0_14px_rgba(0,210,255,0.7)]";
                  borderColor = "border-cyan-400 dark:border-cyan-200";
                  labelColor = "text-cyan-600 dark:text-cyan-300 font-bold";
                }

                // Proportional normalized height
                const heightPercent = valRange === 0 ? 50 : Math.round(15 + ((value - minVal) / valRange) * 80);

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full max-w-[48px] group transition-all duration-150"
                  >
                    <span className={cn("text-[10px] font-mono mb-1 transition-colors", labelColor)}>
                      {value}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={cn(
                        "w-full rounded-t-lg border transition-all duration-200 relative",
                        barColor,
                        borderColor
                      )}
                    />
                    <span className="text-[9px] font-mono dark:text-slate-500 text-slate-400 mt-1">
                      {idx}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Live Step Explanation & Cumulative Telemetry */}
            <div className="p-4 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] text-xs sm:text-sm font-mono dark:text-slate-300 text-[#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="dark:text-slate-400 text-[#737373]">
                Action: <strong className="dark:text-white text-[#171717] font-semibold">{currentStep.description}</strong>
              </span>
              <span className="text-xs font-mono dark:text-slate-400 text-[#737373]">
                Comparisons: <strong className="dark:text-blue-300 text-blue-700">{currentStep.comps}</strong> / {totalComparisons} · Swaps: <strong className="dark:text-amber-300 text-amber-700">{currentStep.swaps}</strong> / {totalSwaps}
              </span>
            </div>
          </div>

          {/* Interactive Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 card-base p-6 dark:border-white/10 border-[#E5E5E5] mb-12 shadow-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]">
            {/* Playback Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleTogglePlay}
                className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 rounded-xl flex-1 justify-center"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Execution
                  </>
                )}
              </button>

              <button
                onClick={handleStepBackward}
                disabled={currentStepIndex <= 0}
                className="btn-secondary text-xs px-3 py-2.5 rounded-xl disabled:opacity-40"
                title="Single Step Backward"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleStepForward}
                disabled={currentStepIndex >= steps.length - 1}
                className="btn-secondary text-xs px-3 py-2.5 rounded-xl disabled:opacity-40"
                title="Single Step Forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="btn-secondary text-xs px-3 py-2.5 rounded-xl"
                title="Reset with New Random Array"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Delay Control */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono dark:text-slate-400 text-[#737373]">
                <span>Step Delay: <strong className="dark:text-white text-[#171717]">{speed}ms</strong></span>
                <span className="dark:text-slate-500 text-slate-400">Fast (50ms) ↔ Slow (800ms)</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="50"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-[#FF7A00] dark:accent-[#0A84FF] cursor-pointer"
              />
            </div>

            {/* Array Size Control */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono dark:text-slate-400 text-[#737373]">
                <span>Array Size: <strong className="dark:text-white text-[#171717]">{arraySize}</strong> elements</span>
                <span className="dark:text-slate-500 text-slate-400">Min: 8 ↔ Max: 28</span>
              </div>
              <input
                type="range"
                min="8"
                max="28"
                step="2"
                value={arraySize}
                onChange={(e) => handleArraySizeChange(Number(e.target.value))}
                className="w-full accent-[#FF7A00] dark:accent-[#0A84FF] cursor-pointer"
              />
            </div>
          </div>

          {/* Deep-dive theory link */}
          <div className="flex items-center justify-between pt-6 border-t dark:border-white/[0.08] border-[#E5E5E5]">
            <Link
              href="/daa/sorting"
              className="text-xs text-[#0A84FF] hover:text-cyan-300 font-semibold font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Read Full Mathematical Analysis &amp; Correctness Proofs for Sorting Algorithms
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

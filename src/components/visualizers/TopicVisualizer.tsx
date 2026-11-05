"use client";

import React from "react";
import dynamic from "next/dynamic";

// DAA Visualizers
import SortingVisualizerCompact from "./SortingVisualizerCompact";
import GraphVisualizerCompact from "./GraphVisualizerCompact";
import DPAcceptorVisualizer from "./DPAcceptorVisualizer";
import GreedyVisualizer from "./GreedyVisualizer";
import DivideConquerVisualizer from "./DivideConquerVisualizer";
import NPCompletenessVisualizer from "./NPCompletenessVisualizer";

// POAI Visualizers
import SearchVisualizer from "./SearchVisualizer";
import CSPVisualizer from "./CSPVisualizer";
import KnowledgeVisualizer from "./KnowledgeVisualizer";
import MLVisualizer from "./MLVisualizer";
import NeuralNetVisualizer from "./NeuralNetVisualizer";
import AgentVisualizer from "./AgentVisualizer";
import MinimaxVisualizer from "./MinimaxVisualizer";

// Advanced Visualizers
import ApproximationVisualizer from "./ApproximationVisualizer";
import RandomizedVisualizer from "./RandomizedVisualizer";
import ComplexityVisualizer from "./ComplexityVisualizer";
import DeepLearningVisualizer from "./DeepLearningVisualizer";
import OnlineVisualizer from "./OnlineVisualizer";
import ParameterizedVisualizer from "./ParameterizedVisualizer";

interface TopicVisualizerProps {
  slug: string;
  course?: string;
}

export default function TopicVisualizer({ slug, course }: TopicVisualizerProps) {
  switch (slug) {
    // DAA
    case "sorting":
      return <SortingVisualizerCompact />;
    case "graphs":
      return <GraphVisualizerCompact />;
    case "dp":
      return <DPAcceptorVisualizer />;
    case "greedy":
      return <GreedyVisualizer />;
    case "divide-conquer":
      return <DivideConquerVisualizer />;
    case "np-completeness":
      return <NPCompletenessVisualizer />;

    // POAI
    case "search":
      return <SearchVisualizer />;
    case "csp":
      return <CSPVisualizer />;
    case "minimax":
      return <MinimaxVisualizer />;
    case "knowledge":
      return <KnowledgeVisualizer />;
    case "ml":
      return <MLVisualizer />;
    case "neural-networks":
      return <NeuralNetVisualizer />;
    case "agents":
      return <AgentVisualizer />;

    // Advanced
    case "approximation":
      return <ApproximationVisualizer />;
    case "randomized":
      return <RandomizedVisualizer />;
    case "complexity":
      return <ComplexityVisualizer />;
    case "deep-learning":
      return <DeepLearningVisualizer />;
    case "online-algorithms":
      return <OnlineVisualizer />;
    case "parameterized":
      return <ParameterizedVisualizer />;

    default:
      return null;
  }
}

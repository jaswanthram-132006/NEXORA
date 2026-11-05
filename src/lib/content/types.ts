export interface TopicContent {
  slug: string;
  course: "daa" | "poai" | "advanced";
  courseTitle: string;
  courseHref: string;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: "violet" | "cyan" | "emerald";
  complexity: {
    time: string;
    space: string;
    paradigm: string;
    bestCase?: string;
    worstCase?: string;
  };
  tags: string[];
  overview: string;
  motivation: string;
  keyConcepts: {
    title: string;
    description: string;
    detail?: string;
  }[];
  workingPrinciples: {
    step: number;
    title: string;
    description: string;
  }[];
  codeExample: {
    language: string;
    title: string;
    code: string;
    explanation: string;
  };
  walkthrough: {
    title: string;
    scenario: string;
    steps: {
      step: string;
      state: string;
      note: string;
    }[];
    conclusion: string;
  };
  applications: string[];
  simulationLink?: {
    href: string;
    label: string;
  };
  relatedTopics: {
    title: string;
    href: string;
    relationship: string;
  }[];
}

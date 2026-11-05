import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { advancedTopicsData } from "@/lib/content/advanced";
import TopicPageLayout from "@/components/content/TopicPageLayout";

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  return Object.keys(advancedTopicsData).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params;
  const data = advancedTopicsData[topic];
  if (!data) {
    return { title: "Topic Not Found | NEXORA" };
  }
  return {
    title: `${data.title} | Advanced | NEXORA`,
    description: data.overview,
  };
}

export default async function AdvancedTopicPage({ params }: PageProps) {
  const { topic } = await params;
  const data = advancedTopicsData[topic];

  if (!data) {
    notFound();
  }

  return <TopicPageLayout topic={data} />;
}

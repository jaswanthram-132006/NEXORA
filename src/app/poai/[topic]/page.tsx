import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { poaiTopicsData } from "@/lib/content/poai";
import TopicPageLayout from "@/components/content/TopicPageLayout";

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  return Object.keys(poaiTopicsData).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params;
  const data = poaiTopicsData[topic];
  if (!data) {
    return { title: "Topic Not Found | NEXORA" };
  }
  return {
    title: `${data.title} | POAI | NEXORA`,
    description: data.overview,
  };
}

export default async function POAITopicPage({ params }: PageProps) {
  const { topic } = await params;
  const data = poaiTopicsData[topic];

  if (!data) {
    notFound();
  }

  return <TopicPageLayout topic={data} />;
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { daaTopicsData } from "@/lib/content/daa";
import TopicPageLayout from "@/components/content/TopicPageLayout";

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  return Object.keys(daaTopicsData).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params;
  const data = daaTopicsData[topic];
  if (!data) {
    return { title: "Topic Not Found | NEXORA" };
  }
  return {
    title: `${data.title} | DAA | NEXORA`,
    description: data.overview,
  };
}

export default async function DAATopicPage({ params }: PageProps) {
  const { topic } = await params;
  const data = daaTopicsData[topic];

  if (!data) {
    notFound();
  }

  return <TopicPageLayout topic={data} />;
}

export { generateMetadata } from "./metadata";

import { PostClient } from "./post-client";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  return <PostClient slug={slug} />;
}

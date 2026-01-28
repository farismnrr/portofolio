import { ProjectCard } from "@/components";
import { getPosts } from "@/utils/utils";
import { Column } from "@once-ui-system/core";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export async function Projects({ range, exclude }: ProjectsProps) {
  const allProjects = getPosts(["content", "projects"]);

  // Filter and sort
  let filteredProjects = allProjects;
  if (exclude && exclude.length > 0) {
    filteredProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = filteredProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          avatars={
            post.metadata.team?.map((member) => ({ src: member.avatar, alt: member.name })) || []
          }
          link={post.metadata.link || ""}
        />
      ))}
    </Column>
  );
}

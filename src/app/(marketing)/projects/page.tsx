import { Projects } from "@/components/projects/Projects";
import { about, baseURL, person, projects } from "@/resources";
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: projects.title,
    description: projects.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(projects.title)}`,
    path: projects.path,
  });
}

export default function ProjectsPage() {
  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={projects.path}
        title={projects.title}
        description={projects.description}
        image={`/api/og/generate?title=${encodeURIComponent(projects.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {projects.title}
      </Heading>
      <Projects />
    </Column>
  );
}

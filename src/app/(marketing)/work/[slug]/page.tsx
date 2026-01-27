import { CustomMDX, ScrollToHash } from "@/components";
import { getProjectBySlug } from "@/lib/projects";
import { about, baseURL, person, work } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import {
  AvatarGroup,
  Column,
  Heading,
  Media,
  Meta,
  Row,
  Schema,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getProjectBySlug(slug);

    return Meta.generate({
      title: post.seo_metadata?.title || post.title,
      description: post.seo_metadata?.description || post.summary,
      baseURL: baseURL,
      image:
        post.seo_metadata?.og_image || post.images[0] || `/api/og/generate?title=${post.title}`,
      path: `${work.path}/${post.slug}`,
    });
  } catch {
    return {};
  }
}

export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getProjectBySlug>> | undefined;
  try {
    post = await getProjectBySlug(slug);
  } catch {
    notFound();
  }

  const avatars =
    post.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${work.path}/${post.slug}`}
        title={post.seo_metadata?.title || post.title}
        description={post.seo_metadata?.description || post.summary}
        datePublished={post.published_at}
        dateModified={post.published_at}
        image={
          post.seo_metadata?.og_image ||
          post.images[0] ||
          `/api/og/generate?title=${encodeURIComponent(post.title)}`
        }
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column maxWidth="s" gap="16" horizontal="center" align="center">
        <SmartLink href="/work">
          <Text variant="label-strong-m">Projects</Text>
        </SmartLink>
        <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
          {post.published_at && formatDate(post.published_at)}
        </Text>
        <Heading variant="display-strong-m">{post.title}</Heading>
      </Column>
      <Row marginBottom="32" horizontal="center">
        <Row gap="16" vertical="center">
          {post.team && <AvatarGroup reverse avatars={avatars} size="s" />}
          <Text variant="label-default-m" onBackground="brand-weak">
            {post.team?.map((member, idx) => (
              <span key={member.name || idx}>
                {idx > 0 && (
                  <Text as="span" onBackground="neutral-weak">
                    ,{" "}
                  </Text>
                )}
                <SmartLink href={member.linkedIn}>{member.name}</SmartLink>
              </span>
            ))}
          </Text>
        </Row>
      </Row>
      {post.link && (
        <Row horizontal="center" marginBottom="32">
          <SmartLink href={post.link}>
            <Row gap="8" vertical="center" onBackground="brand-strong">
              <Text variant="label-strong-l">Visit Live Project</Text>
              <Text variant="label-strong-l">
                <span className="arrow">→</span>
              </Text>
            </Row>
          </SmartLink>
        </Row>
      )}
      {post.images.length > 0 && (
        <Media priority aspectRatio="16 / 9" radius="m" alt="image" src={post.images[0]} />
      )}
      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <CustomMDX source={post.content} />
      </Column>
      {post.repository && (
        <Row horizontal="center" marginTop="40" marginBottom="40">
          <SmartLink href={post.repository}>
            <Row gap="8" vertical="center" onBackground="brand-strong">
              <Text variant="label-strong-l">View Code on GitHub</Text>
              <Text variant="label-strong-l">
                <span className="arrow">→</span>
              </Text>
            </Row>
          </SmartLink>
        </Row>
      )}
      <ScrollToHash />
    </Column>
  );
}

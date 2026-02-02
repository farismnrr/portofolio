import TableOfContents from "@/components/about/TableOfContents";
import styles from "@/components/about/about.module.scss";
import {
  getAbout,
  getEducations,
  getSkills,
  getSocialLinks,
  getWorkExperiences,
} from "@/lib/about";
import { about, baseURL, person } from "@/resources";
import {
  Avatar,
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Meta,
  Row,
  Schema,
  Tag,
  Text,
} from "@once-ui-system/core";
import React from "react";
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

export default async function About() {
  const [profile, socialLinks, workExperiences, educations, skillCategories] = await Promise.all([
    getAbout(),
    getSocialLinks(),
    getWorkExperiences(),
    getEducations(),
    getSkills(),
  ]);

  const personalInfo = {
    name: profile?.name || person.name,
    role: profile?.role || person.role,
    avatar: profile?.avatar || person.avatar,
    description: profile?.description || about.intro.description,
    location: person.location,
    languages: person.languages,
  };

  // Map data to structure expected by UI
  const works =
    workExperiences.length > 0
      ? workExperiences.map((w) => ({
          company: w.company,
          timeframe: w.timeframe,
          role: w.role,
          achievements: w.achievements || [],
          images: [] as { src: string; alt: string; width: number; height: number }[],
        }))
      : [];

  const institutions =
    educations.length > 0
      ? educations.map((e) => ({
          name: e.institution,
          description: `${e.degree} (${e.period}). ${e.description}`,
        }))
      : [];

  const skills =
    skillCategories.length > 0
      ? skillCategories.map((s) => ({
          title: s.title,
          description: s.description,
          tags: s.tags.map((t) => ({ name: t.name, icon: t.icon })),
          images: [] as { src: string; alt: string; width: number; height: number }[],
        }))
      : [];

  const structure = [
    {
      title: about.intro.title,
      display: about.intro.display,
      items: [],
    },
    {
      title: about.work.title,
      display: works.length > 0,
      items: works.map((w) => w.company),
    },
    {
      title: about.studies.title,
      display: institutions.length > 0,
      items: institutions.map((i) => i.name),
    },
    {
      title: about.technical.title,
      display: skills.length > 0,
      items: skills.map((s) => s.title),
    },
  ];

  return (
    <Column maxWidth="m">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={about.title}
        description={about.description}
        path={about.path}
        image={`/api/og/generate?title=${encodeURIComponent(about.title)}`}
        author={{
          name: personalInfo.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${personalInfo.avatar}`,
        }}
      />
      {about.tableOfContent.display && (
        <Column
          left="0"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed"
          paddingLeft="24"
          gap="32"
          s={{ hide: true }}
        >
          <TableOfContents structure={structure} about={about} />
        </Column>
      )}
      <Row fillWidth s={{ direction: "column" }} horizontal="center">
        {about.avatar.display && (
          <Column
            className={styles.avatar}
            top="64"
            fitHeight
            position="sticky"
            s={{ position: "relative", style: { top: "auto" } }}
            xs={{ style: { top: "auto" } }}
            minWidth="160"
            paddingX="l"
            paddingBottom="xl"
            gap="m"
            flex={3}
            horizontal="center"
          >
            <Avatar src={personalInfo.avatar} size="xl" />
            <Row gap="8" vertical="center">
              <Icon onBackground="accent-weak" name="globe" />
              {personalInfo.location}
            </Row>
            {personalInfo.languages && personalInfo.languages.length > 0 && (
              <Row wrap gap="8">
                {personalInfo.languages?.map((language, index) => (
                  <Tag key={language || index} size="l">
                    {language}
                  </Tag>
                ))}
              </Row>
            )}
          </Column>
        )}
        <Column className={styles.blockAlign} flex={9} maxWidth={40}>
          <Column
            id={about.intro.title}
            fillWidth
            minHeight="160"
            vertical="center"
            marginBottom="32"
          >
            {about.calendar.display && (
              <Row
                fitWidth
                border="brand-alpha-medium"
                background="brand-alpha-weak"
                radius="full"
                padding="4"
                gap="8"
                marginBottom="m"
                vertical="center"
                className={styles.blockAlign}
                style={{
                  backdropFilter: "blur(var(--static-space-1))",
                }}
              >
                <Icon paddingLeft="12" name="calendar" onBackground="brand-weak" />
                <Row paddingX="8">Schedule a call</Row>
                <IconButton
                  href={about.calendar.link}
                  data-border="rounded"
                  variant="secondary"
                  icon="chevronRight"
                />
              </Row>
            )}
            <Heading className={styles.textAlign} variant="display-strong-xl">
              {personalInfo.name}
            </Heading>
            <Text
              className={styles.textAlign}
              variant="display-default-xs"
              onBackground="neutral-weak"
            >
              {personalInfo.role}
            </Text>
            {socialLinks.length > 0 && (
              <Row
                className={styles.blockAlign}
                paddingTop="20"
                paddingBottom="8"
                gap="8"
                wrap
                horizontal="center"
                fitWidth
                data-border="rounded"
              >
                {socialLinks.map((item) => (
                  <React.Fragment key={item.name}>
                    <Row s={{ hide: true }}>
                      <Button
                        key={item.name}
                        href={item.link}
                        prefixIcon={item.icon || item.name.toLowerCase()} // Prefer explicit icon from DB
                        label={item.name}
                        size="s"
                        weight="default"
                        variant="secondary"
                      />
                    </Row>
                    <Row hide s={{ hide: false }}>
                      <IconButton
                        size="l"
                        key={`${item.name}-icon`}
                        href={item.link}
                        icon={item.icon || item.name.toLowerCase()} // Prefer explicit icon from DB
                        variant="secondary"
                      />
                    </Row>
                  </React.Fragment>
                ))}
              </Row>
            )}
          </Column>

          {about.intro.display && (
            <Column textVariant="body-default-l" fillWidth gap="m" marginBottom="xl">
              {personalInfo.description}
            </Column>
          )}

          {works.length > 0 && (
            <>
              <Heading as="h2" id={about.work.title} variant="display-strong-s" marginBottom="m">
                {about.work.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
                {works.map((experience, index) => (
                  <Column key={`${experience.company}-${experience.role}-${index}`} fillWidth>
                    <Row fillWidth horizontal="between" vertical="end" marginBottom="4">
                      <Text id={experience.company} variant="heading-strong-l">
                        {experience.company}
                      </Text>
                      <Text variant="heading-default-xs" onBackground="neutral-weak">
                        {experience.timeframe}
                      </Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="brand-weak" marginBottom="m">
                      {experience.role}
                    </Text>
                    <Column
                      as="ul"
                      gap="16"
                      style={{ listStyleType: "disc", paddingLeft: "var(--static-space-20)" }}
                    >
                      {experience.achievements.map((achievement: string, index: number) => (
                        <Text
                          as="li"
                          variant="body-default-m"
                          key={`${experience.company}-${index}`}
                        >
                          {achievement}
                        </Text>
                      ))}
                    </Column>
                    {/* Images are intentionally skipped as backend doesn't support them yet */}
                  </Column>
                ))}
              </Column>
            </>
          )}

          {institutions.length > 0 && (
            <>
              <Heading as="h2" id={about.studies.title} variant="display-strong-s" marginBottom="m">
                {about.studies.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
                {institutions.map((institution, index) => (
                  <Column key={`${institution.name}-${index}`} fillWidth gap="4">
                    <Text id={institution.name} variant="heading-strong-l">
                      {institution.name}
                    </Text>
                    <Text variant="heading-default-xs" onBackground="neutral-weak">
                      {institution.description.split(/(\*\*.*?\*\*)/).map((part, i) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </Text>
                  </Column>
                ))}
              </Column>
            </>
          )}

          {skills.length > 0 && (
            <>
              <Heading
                as="h2"
                id={about.technical.title}
                variant="display-strong-s"
                marginBottom="40"
              >
                {about.technical.title}
              </Heading>
              <Column fillWidth gap="l">
                {skills.map((skill, index) => (
                  <Column key={`${skill.title}-${index}`} fillWidth gap="4">
                    <Text id={skill.title} variant="heading-strong-l">
                      {skill.title}
                    </Text>
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {skill.description}
                    </Text>
                    {skill.tags && skill.tags.length > 0 && (
                      <Row wrap gap="8" paddingTop="8">
                        {skill.tags.map((tag, tagIndex) => (
                          // Explicitely use tag.icon if available, else maybe default or omit
                          <Tag key={`${skill.title}-${tagIndex}`} size="l" prefixIcon={tag.icon}>
                            {tag.name}
                          </Tag>
                        ))}
                      </Row>
                    )}
                  </Column>
                ))}
              </Column>
            </>
          )}
        </Column>
      </Row>
    </Column>
  );
}

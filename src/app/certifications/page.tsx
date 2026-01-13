import { Column, Heading, Meta, Schema, Grid, Row, Text } from "@once-ui-system/core";
import { baseURL, certifications, person } from "@/resources";
import Image from "next/image";

export async function generateMetadata() {
    return Meta.generate({
        title: certifications.title,
        description: certifications.description,
        baseURL: baseURL,
        image: `/api/og/generate?title=${encodeURIComponent(certifications.title)}`,
        path: certifications.path,
    });
}

// Achievements Data
const achievements = [
    {
        id: 1,
        title: "Best Innovation Award - SEMAR IoT 2022",
        image: "/images/achievements/semar-iot-2022-best-innovation.jpg"
    },
    {
        id: 2,
        title: "National IoT-AI Joint Workshop & Competition",
        image: "/images/achievements/national-iot-ai-competition.jpg"
    },
    {
        id: 3,
        title: "National IoT-AI Seminar & Competition 2025",
        image: "/images/achievements/national-iot-ai-seminar-competition-2025.jpg"
    },
];

const alibabaCerts = [
    { id: 1, title: "Alibaba Cloud Cert 1", image: "/images/gallery/vertical-1.jpg" },
    { id: 2, title: "Alibaba Cloud Cert 2", image: "/images/gallery/vertical-2.jpg" },
    { id: 3, title: "Alibaba Cloud Cert 3", image: "/images/gallery/vertical-3.jpg" },
];

const courseraCerts = [
    { id: 1, title: "Coursera Cert 1", image: "/images/gallery/horizontal-1.jpg" },
    { id: 2, title: "Coursera Cert 2", image: "/images/gallery/horizontal-2.jpg" },
    { id: 3, title: "Coursera Cert 3", image: "/images/gallery/horizontal-3.jpg" },
    { id: 4, title: "Coursera Cert 4", image: "/images/gallery/horizontal-4.jpg" },
];

const dicodingCerts = [
    { id: 1, title: "Dicoding Cert 1", image: "/images/gallery/vertical-1.jpg" },
    { id: 2, title: "Dicoding Cert 2", image: "/images/gallery/vertical-2.jpg" },
    { id: 3, title: "Dicoding Cert 3", image: "/images/gallery/vertical-3.jpg" },
    { id: 4, title: "Dicoding Cert 4", image: "/images/gallery/vertical-4.jpg" },
    { id: 5, title: "Dicoding Cert 5", image: "/images/gallery/horizontal-1.jpg" },
];

export default function Certifications() {
    return (
        <Column maxWidth="m" paddingTop="24">
            <Schema
                as="blogPosting"
                baseURL={baseURL}
                title={certifications.title}
                description={certifications.description}
                path={certifications.path}
                image={`/api/og/generate?title=${encodeURIComponent(certifications.title)}`}
                author={{
                    name: person.name,
                    url: `${baseURL}/certifications`,
                    image: `${baseURL}${person.avatar}`,
                }}
            />

            <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
                {certifications.title}
            </Heading>

            <Column fillWidth flex={1} gap="48" paddingX="l">
                {/* Achievements Section */}
                <Column fillWidth gap="24">
                    <Heading as="h2" variant="heading-strong-l">
                        Achievements
                    </Heading>
                    <Grid
                        columns={3}
                        gap="16"
                        fillWidth
                    >
                        {achievements.map((achievement) => (
                            <Column
                                key={achievement.id}
                                border="neutral-alpha-weak"
                                radius="l"
                                padding="4"
                                gap="8"
                                background="surface"
                            >
                                <Image
                                    src={achievement.image}
                                    alt={achievement.title}
                                    width={600}
                                    height={400}
                                    style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                                />
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    {achievement.title}
                                </Text>
                            </Column>
                        ))}
                    </Grid>
                </Column>

                {/* Certifications Section */}
                <Column fillWidth gap="40">
                    <Heading as="h2" variant="heading-strong-l">
                        Certifications
                    </Heading>

                    {/* Alibaba Cloud */}
                    <Column fillWidth gap="16">
                        <Heading as="h3" variant="heading-strong-m">
                            Alibaba Cloud
                        </Heading>
                        <Grid columns={3} gap="16" fillWidth>
                            {alibabaCerts.map((cert) => (
                                <Column
                                    key={cert.id}
                                    border="neutral-alpha-weak"
                                    radius="l"
                                    padding="4"
                                    gap="8"
                                    background="surface"
                                >
                                    <Image
                                        src={cert.image}
                                        alt={cert.title}
                                        width={600}
                                        height={800}
                                        style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                                    />
                                    <Text variant="body-default-s" onBackground="neutral-weak">
                                        {cert.title}
                                    </Text>
                                </Column>
                            ))}
                        </Grid>
                    </Column>

                    {/* Coursera */}
                    <Column fillWidth gap="16">
                        <Heading as="h3" variant="heading-strong-m">
                            Coursera
                        </Heading>
                        <Grid columns={3} gap="16" fillWidth>
                            {courseraCerts.map((cert) => (
                                <Column
                                    key={cert.id}
                                    border="neutral-alpha-weak"
                                    radius="l"
                                    padding="4"
                                    gap="8"
                                    background="surface"
                                >
                                    <Image
                                        src={cert.image}
                                        alt={cert.title}
                                        width={600}
                                        height={400}
                                        style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                                    />
                                    <Text variant="body-default-s" onBackground="neutral-weak">
                                        {cert.title}
                                    </Text>
                                </Column>
                            ))}
                        </Grid>
                    </Column>

                    {/* Dicoding */}
                    <Column fillWidth gap="16">
                        <Heading as="h3" variant="heading-strong-m">
                            Dicoding
                        </Heading>
                        <Grid columns={3} gap="16" fillWidth>
                            {dicodingCerts.map((cert) => (
                                <Column
                                    key={cert.id}
                                    border="neutral-alpha-weak"
                                    radius="l"
                                    padding="4"
                                    gap="8"
                                    background="surface"
                                >
                                    <Image
                                        src={cert.image}
                                        alt={cert.title}
                                        width={600}
                                        height={800}
                                        style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                                    />
                                    <Text variant="body-default-s" onBackground="neutral-weak">
                                        {cert.title}
                                    </Text>
                                </Column>
                            ))}
                        </Grid>
                    </Column>
                </Column>
            </Column>
        </Column>
    );
}

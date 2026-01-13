import { Column, Heading, Meta, Schema, Grid, Row, Text, Media } from "@once-ui-system/core";
import { baseURL, certifications, person } from "@/resources";
import CertificationList from "./CertificationList";


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
    { id: 1, title: "Alibaba Cloud Certified Associate", image: "/images/certifications/alibaba/Alibaba%20Cloud%20Certified%20Associate.jpg" },
    { id: 2, title: "Alibaba Cloud Certified Professional", image: "/images/certifications/alibaba/Alibaba%20Cloud%20Certified%20Professional.jpg" },
    { id: 3, title: "[Exam] Operate and Manage a Cloud Server", image: "/images/certifications/alibaba/[Exam]%20Operate%20and%20Manage%20a%20Cloud%20Server.jpg" },
];

const courseraCerts = [
    { id: 1, title: "Coursera 5W3ULYGGV5TP", image: "/images/certifications/coursera/Coursera%205W3ULYGGV5TP.jpg" },
    { id: 2, title: "Coursera FB35DMJ7K565", image: "/images/certifications/coursera/Coursera%20FB35DMJ7K565.jpg" },
    { id: 3, title: "Coursera N9B6GRKYD68X", image: "/images/certifications/coursera/Coursera%20N9B6GRKYD68X.jpg" },
    { id: 4, title: "Coursera R5S4FVC7Q9B7", image: "/images/certifications/coursera/Coursera%20R5S4FVC7Q9B7.jpg" },
    { id: 5, title: "Coursera VCVNCYTHVKLH", image: "/images/certifications/coursera/Coursera%20VCVNCYTHVKLH.jpg" },
    { id: 6, title: "Google IT Support Professional Certificate", image: "/images/certifications/coursera/Google%20IT%20Support%20Professional%20Certificate.jpg" },
];

const dicodingCerts = [
    { id: 1, title: "Architecting on AWS", image: "/images/certifications/dicoding/Architecting%20on%20AWS%20(Membangun%20Arsitektur%20Cloud%20di%20AWS).jpg" },
    { id: 2, title: "Belajar Dasar Git dengan GitHub", image: "/images/certifications/dicoding/Belajar%20Dasar%20Git%20dengan%20GitHub.jpg" },
    { id: 3, title: "Belajar Dasar Pemrograman JavaScript", image: "/images/certifications/dicoding/Belajar%20Dasar%20Pemrograman%20JavaScript.jpg" },
    { id: 4, title: "Belajar Dasar Pemrograman Web", image: "/images/certifications/dicoding/Belajar%20Dasar%20Pemrograman%20Web.jpg" },
    { id: 5, title: "Belajar Dasar SQL", image: "/images/certifications/dicoding/Belajar%20Dasar%20Structured%20Query%20Language%20(SQL).jpg" },
    { id: 6, title: "Belajar Fundamental Aplikasi Back-End", image: "/images/certifications/dicoding/Belajar%20Fundamental%20Aplikasi%20Back-End.jpg" },
    { id: 7, title: "Belajar Machine Learning untuk Pemula", image: "/images/certifications/dicoding/Belajar%20Machine%20Learning%20untuk%20Pemula.jpg" },
    { id: 8, title: "Belajar Membuat Aplikasi Back-End dengan GCP", image: "/images/certifications/dicoding/Belajar%20Membuat%20Aplikasi%20Back-End%20untuk%20Pemula%20dengan%20Google%20Cloud.jpg" },
    { id: 9, title: "Belajar Membuat Aplikasi Back-End untuk Pemula", image: "/images/certifications/dicoding/Belajar%20Membuat%20Aplikasi%20Back-End%20untuk%20Pemula.jpg" },
    { id: 10, title: "Belajar Membuat Front-End Web untuk Pemula", image: "/images/certifications/dicoding/Belajar%20Membuat%20Front-End%20Web%20untuk%20Pemula.jpg" },
    { id: 11, title: "Cloud Practitioner Essentials (AWS Cloud)", image: "/images/certifications/dicoding/Cloud%20Practitioner%20Essentials%20(Belajar%20Dasar%20AWS%20Cloud).jpg" },
    { id: 12, title: "Memulai Dasar Pemrograman Software", image: "/images/certifications/dicoding/Memulai%20Dasar%20Pemrograman%20untuk%20Menjadi%20Pengembang%20Software.jpg" },
    { id: 13, title: "Memulai Pemrograman dengan Haskell", image: "/images/certifications/dicoding/Memulai%20Pemrograman%20dengan%20Haskell.jpg" },
    { id: 14, title: "Memulai Pemrograman dengan Python", image: "/images/certifications/dicoding/Memulai%20Pemrograman%20dengan%20Python.jpg" },
    { id: 15, title: "Menjadi Google Cloud Architect", image: "/images/certifications/dicoding/Menjadi%20Google%20Cloud%20Architect.jpg" },
    { id: 16, title: "Menjadi Google Cloud Engineer", image: "/images/certifications/dicoding/Menjadi%20Google%20Cloud%20Engineer.jpg" },
    { id: 17, title: "Pengenalan ke Logika Pemrograman", image: "/images/certifications/dicoding/Pengenalan%20ke%20Logika%20Pemrograman%20(Programming%20Logic%20101).jpg" },
    { id: 18, title: "Sertifikat Kelulusan Kelas Intermediate", image: "/images/certifications/dicoding/Sertifikat%20Kelulusan%20kelas%20intermediate.jpg" },
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

            <CertificationList
                achievements={achievements}
                alibabaCerts={alibabaCerts}
                courseraCerts={courseraCerts}
                dicodingCerts={dicodingCerts}
            />
        </Column>
    );
}

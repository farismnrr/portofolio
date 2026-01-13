"use client";

import { useState } from "react";
import { Grid, Column, Heading, Media } from "@once-ui-system/core";
import Image from "next/image";

interface Cert {
    id: number;
    title: string;
    image: string;
}

interface CertificationListProps {
    achievements: Cert[];
    alibabaCerts: Cert[];
    courseraCerts: Cert[];
    dicodingCerts: Cert[];
}

export default function CertificationList({
    achievements,
    alibabaCerts,
    courseraCerts,
    dicodingCerts
}: CertificationListProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageClick = (image: string) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const renderGrid = (items: Cert[]) => (
        <Grid columns={3} gap="16" fillWidth>
            {items.map((item) => (
                <Column
                    key={item.id}
                    border="neutral-alpha-weak"
                    radius="l"
                    overflow="hidden"
                    background="neutral-alpha-weak"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleImageClick(item.image)}
                >
                    <Media
                        src={item.image}
                        alt={item.title}
                        aspectRatio="4 / 3"
                        width={1200}
                        height={900}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                </Column>
            ))}
        </Grid>
    );

    return (
        <>
            <Column fillWidth gap="48" paddingX="l">
                {/* Achievements Section */}
                <Column fillWidth gap="24">
                    <Heading as="h2" variant="heading-strong-l">
                        Achievements
                    </Heading>
                    {renderGrid(achievements)}
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
                        {renderGrid(alibabaCerts)}
                    </Column>

                    {/* Coursera */}
                    <Column fillWidth gap="16">
                        <Heading as="h3" variant="heading-strong-m">
                            Coursera
                        </Heading>
                        {renderGrid(courseraCerts)}
                    </Column>

                    {/* Dicoding */}
                    <Column fillWidth gap="16">
                        <Heading as="h3" variant="heading-strong-m">
                            Dicoding
                        </Heading>
                        {renderGrid(dicodingCerts)}
                    </Column>
                </Column>
            </Column>

            {/* Custom Modal */}
            {selectedImage && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "default",
                    }}
                    onClick={closeModal}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        style={{
                            position: "absolute",
                            top: "24px",
                            right: "24px",
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "none",
                            borderRadius: "50%",
                            width: "48px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "white",
                            fontSize: "24px",
                            transition: "background 0.2s",
                            zIndex: 10000,
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                    >
                        ✕
                    </button>

                    <div
                        style={{
                            position: "relative",
                            width: "90vw",
                            height: "90vh",
                        }}
                    // onClick={(e) => e.stopPropagation()} // Removed to allow close on click outside (bubble up to overlay)
                    >
                        <Image
                            src={selectedImage}
                            alt="Full View"
                            fill
                            style={{ objectFit: "contain" }}
                            quality={100}
                            priority
                        />
                    </div>
                </div>
            )}
        </>
    );
}

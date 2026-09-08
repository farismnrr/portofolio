import fs from "node:fs";
import path from "node:path";
import { Flex, Meta, Schema } from "@once-ui-system/core";
import sharp from "sharp";
import GalleryView from "@/components/gallery/GalleryView";
import { baseURL, gallery, person } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: "/images/og/home.jpg",
    path: gallery.path,
  });
}

async function getGalleryImages() {
  const galleryDir = path.join(process.cwd(), "public/images/gallery");
  if (!fs.existsSync(galleryDir)) return [];

  const files = fs.readdirSync(galleryDir).filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

  return Promise.all(
    files.map(async (file) => {
      const filePath = path.join(galleryDir, file);
      let orientation: "horizontal" | "vertical" = "horizontal";
      try {
        const dimensions = await sharp(filePath).metadata();
        if ((dimensions.width || 0) < (dimensions.height || 0)) {
          orientation = "vertical";
        }
      } catch (_error) {}

      return {
        src: `/images/gallery/${file}`,
        orientation,
        alt: file.replace(/\.(jpg|jpeg|png|webp)$/i, "").replace(/-/g, " "),
      };
    }),
  );
}

export default async function Gallery() {
  const images = await getGalleryImages();

  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={"/images/og/home.jpg"}
        author={{
          name: person.name,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <GalleryView images={images} />
    </Flex>
  );
}

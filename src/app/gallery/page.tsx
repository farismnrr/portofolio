import fs from "node:fs";
import path from "node:path";
import GalleryView from "@/components/gallery/GalleryView";
import { baseURL, gallery, person } from "@/resources";
import { Flex, Meta, Schema } from "@once-ui-system/core";
import sizeOf from "image-size";

export async function generateMetadata() {
  return Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
    path: gallery.path,
  });
}

function getGalleryImages() {
  const galleryDir = path.join(process.cwd(), "public/images/gallery");
  if (!fs.existsSync(galleryDir)) return [];

  const files = fs.readdirSync(galleryDir).filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

  return files.map((file) => {
    const filePath = path.join(galleryDir, file);
    let orientation: "horizontal" | "vertical" = "horizontal";
    try {
      const buffer = fs.readFileSync(filePath);
      const dimensions = sizeOf(buffer);
      if ((dimensions.width || 0) < (dimensions.height || 0)) {
        orientation = "vertical";
      }
    } catch (error) {
      console.error(`Error reading image dimensions for ${file}:`, error);
    }

    return {
      src: `/images/gallery/${file}`,
      orientation,
      alt: file.replace(/\.(jpg|jpeg|png|webp)$/i, "").replace(/-/g, " "),
    };
  });
}

export default function Gallery() {
  const images = getGalleryImages();

  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
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

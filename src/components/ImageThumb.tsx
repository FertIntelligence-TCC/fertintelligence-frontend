import { useEffect, useState } from "react";
import { Box, Image } from "@chakra-ui/react";
import { FiImage } from "react-icons/fi";
import { getImageFromMongoDB } from "@/services/imageService";

export default function ImageThumb({ imageId, alt }: { imageId?: string; alt: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true;
    if (!imageId) { setSrc(""); return; }
    getImageFromMongoDB(imageId).then((img) => active && setSrc(img || ""));
    return () => { active = false; };
  }, [imageId]);

  return (
    <Box h="90px" w="100%" mb={2} borderRadius="md" overflow="hidden" bg="gray.100" _dark={{bg:"gray.800"}} display="flex" alignItems="center" justifyContent="center">
      {src ? <Image src={src} alt={alt} h="100%" w="100%" objectFit="cover" /> : <FiImage opacity={0.45} />}
    </Box>
  );
}

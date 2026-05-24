import { useEffect, useMemo, useState } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import { FiImage } from "react-icons/fi";
import { getImageFromMongoDB } from "@/services/imageService";

interface ImageThumbProps {
  imageId?: string;
  alt: string;
  fallbackImageId?: string;
  reloadToken?: number;
}

const MONGODB_OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

const normalizeImageId = (id?: string) => {
  const normalized = id?.trim();
  if (!normalized) return "";

  const invalidIds = ["null", "undefined", "nan"];
  if (invalidIds.includes(normalized.toLowerCase())) return "";

  return normalized;
};

const isValidMongoObjectId = (id: string) => MONGODB_OBJECT_ID_REGEX.test(id);

export default function ImageThumb({ imageId, alt, fallbackImageId, reloadToken }: ImageThumbProps) {
  const [src, setSrc] = useState("");
  const primaryImageId = useMemo(() => normalizeImageId(imageId), [imageId]);
  const normalizedFallbackImageId = useMemo(() => normalizeImageId(fallbackImageId), [fallbackImageId]);

  useEffect(() => {
    let active = true;

    const fetchImage = async () => {
      const candidates = [primaryImageId, normalizedFallbackImageId]
        .filter(Boolean)
        .filter(isValidMongoObjectId);

      for (const candidateId of candidates) {
        try {
          const img = await getImageFromMongoDB(candidateId);
          if (img) {
            if (active) setSrc(img);
            return;
          }
        } catch {
          // If retrieval fails, keep trying next candidate and fall back to placeholder.
        }
      }

      if (active) setSrc("");
    };

    fetchImage();
    return () => {
      active = false;
    };
  }, [primaryImageId, normalizedFallbackImageId, reloadToken]);

  return (
    <Box h="90px" w="100%" mb={2} borderRadius="md" overflow="hidden" bg="gray.100" _dark={{ bg: "gray.800" }} display="flex" alignItems="center" justifyContent="center" flexDir="column" gap={1}>
      {src ? (
        <Image src={src} alt={alt} h="100%" w="100%" objectFit="cover" />
      ) : (
        <>
          <FiImage opacity={0.45} />
          <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
            Sem imagem
          </Text>
        </>
      )}
    </Box>
  );
}

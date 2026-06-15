import { useEffect, useRef, useState } from "react";
import { Box, Button, Image, Input, Text, VStack } from "@chakra-ui/react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { getImageFromMongoDB, updateImageMongoDB, uploadImageMongoDB } from "@/services/imageService";

type Props = {
  currentImageId?: string;
  onImageIdChange: (id: string) => void;
  label?: string;
  readOnly?: boolean;
};

export default function EntityImageUploader({ currentImageId, onImageIdChange, label = "Imagem", readOnly = false }: Props) {
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentImageId) {
        setPreview("");
        return;
      }
      setLoading(true);
      const img = await getImageFromMongoDB(currentImageId);
      if (active) {
        setPreview(img || "");
        setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [currentImageId]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || readOnly) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = String(reader.result || "");
      if (!base64.startsWith("data:image")) return;
      setPreview(base64);
      setLoading(true);

      try {
        const resp = currentImageId
          ? await updateImageMongoDB(base64, currentImageId)
          : await uploadImageMongoDB(base64);
        const newId = resp?._id || currentImageId || "";
        if (newId) onImageIdChange(newId);
      } catch (error) {
        console.error("Erro ao enviar imagem da entidade:", error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <VStack align="stretch" gap={2}>
      <Text fontWeight="semibold">{label}</Text>
      <Box borderWidth="1px" borderRadius="md" p={3} minH="180px" display="flex" alignItems="center" justifyContent="center" bg="gray.50" _dark={{ bg: "gray.800" }}>
        {preview ? <Image src={preview} alt={label} maxH="160px" objectFit="cover" borderRadius="md" /> : <FiImage opacity={0.5} size={40} />}
      </Box>
      {!readOnly && (
        <>
          <Input ref={inputRef} type="file" accept="image/*" onChange={handleFile} display="none" />
          <Button onClick={() => inputRef.current?.click()} disabled={loading}>
            <FiUploadCloud />
            {loading ? "Processando..." : "Enviar imagem"}
          </Button>
          {currentImageId && (
            <Button variant="outline" colorPalette="red" onClick={() => onImageIdChange("")} disabled={loading}>
              <FiTrash2 />
              Remover imagem
            </Button>
          )}
        </>
      )}
    </VStack>
  );
}

import { useState } from "react";
import { Button, VStack, Heading, Box, Text, Flex } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import { useMutation } from "@tanstack/react-query";

type PasswordVerificationProps = {
  subtitle: string;
  cardHeading: string;
  onConfirm: (password: string, repeatPassword?: string) => Promise<unknown>;
  onCancel: () => void;
  isNewPassword?: boolean;
};

export default function PasswordVerification({
  subtitle,
  cardHeading,
  onConfirm,
  onCancel,
  isNewPassword = false,
}: PasswordVerificationProps) {
  const [passwordForm, setPasswordForm] = useState({
    senha: "",
    senhaRepetida: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const confirmMutation = useMutation({
    mutationFn: (payload: { password: string; repeatPassword?: string }) =>
      onConfirm(payload.password, payload.repeatPassword),
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message ||
        "Erro ao executar a ação. Verifique a senha e tente novamente.";
      setError(errorMessage);
    },
  });

  const handleConfirmClick = () => {
    const { senha, senhaRepetida } = passwordForm;

    if (!senha) {
      setError("A senha é obrigatória.");
      return;
    }

    if (isNewPassword) {
      if (!senhaRepetida) {
        setError("A repetição da nova senha é obrigatória.");
        return;
      }
      if (senha !== senhaRepetida) {
        setError("As novas senhas não coincidem.");
        return;
      }
    }

    confirmMutation.mutate({ password: senha, repeatPassword: senhaRepetida || undefined });
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirmClick();
    }
  };

  return (
    <UserLayout>
      <FertName subtitle={subtitle} />

      <Flex
        justifyContent="center"
        alignItems="center"
        minH="100vh"
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <Box
          bg="whiteAlpha.600"
          _dark={{ bg: "blackAlpha.600" }}
          p={8}
          borderRadius="md"
          boxShadow="lg"
          width={{ base: "90%", md: "400px" }}
          backdropFilter="blur(4px)"
          zIndex={1}
        >
          <Heading mb={6} textAlign="center" size="md">
            {cardHeading}
          </Heading>

          <VStack gap={4} align="stretch">
            {(error || confirmMutation.isError) && (
              <Box bg="red.500" color="white" borderRadius="md" p={3}>
                <Text fontWeight="bold" fontSize="sm">
                  {error || "Houve um erro inesperado. Tente novamente."}
                </Text>
              </Box>
            )}

            <Box>
              <Text textAlign="left" mb={1}>
                {isNewPassword ? "Nova Senha" : "Senha Atual"}
              </Text>
              <PasswordInput
                name="senha"
                value={passwordForm.senha}
                onChange={handleInputChange}
                onKeyDown={handlePasswordKeyDown}
                placeholder={isNewPassword ? "Digite sua nova senha" : "Digite sua senha atual"}
                color="black"
                _dark={{ color: "white" }}
                _placeholder={{ color: "gray.500", _dark: { color: "gray.400" } }}
              />
            </Box>

            {isNewPassword && (
              <Box>
                <Text textAlign="left" mb={1}>
                  Repita a Nova Senha
                </Text>
                <PasswordInput
                  name="senhaRepetida"
                  value={passwordForm.senhaRepetida}
                  onChange={handleInputChange}
                  onKeyDown={handlePasswordKeyDown}
                  placeholder="Digite novamente sua nova senha"
                  color="black"
                  _dark={{ color: "white" }}
                  _placeholder={{ color: "gray.500", _dark: { color: "gray.400" } }}
                />
              </Box>
            )}

            <Button
              onClick={handleConfirmClick}
              width="full"
              color="green.700"
              _hover={{ bg: "green.500", color: "white" }}
              variant="outline"
              loading={confirmMutation.isPending}
              disabled={confirmMutation.isPending}
            >
              Concluir
            </Button>

            <Button
              onClick={onCancel}
              width="full"
              color="pink.700"
              _hover={{ bg: "red.500", color: "white" }}
              variant="outline"
              disabled={confirmMutation.isPending}
            >
              Cancelar
            </Button>
          </VStack>
        </Box>
      </Flex>
    </UserLayout>
  );
}

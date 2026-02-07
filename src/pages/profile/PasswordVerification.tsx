import { useState } from "react";
import {
    Button,
    VStack,
    Heading,
    Box,
    Text,
    Flex,
    Alert, 
} from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import { useMutation } from "@tanstack/react-query";

type PasswordVerificationProps = {
    subtitle: string;
    cardHeading: string;
    // onConfirm recebe a senha e retorna uma Promise (para uso com useMutation)
    onConfirm: (password: string, repeatPassword: string) => Promise<unknown>; 
    onCancel: () => void; // A função de cancelamento
    isNewPassword?: boolean;
};

export default function PasswordVerification({ subtitle, cardHeading, onConfirm, onCancel, isNewPassword = false }: PasswordVerificationProps) {
    const [passwordForm, setPasswordForm] = useState({
        senha: "",
        senhaRepetida: "",
    });
    const [error, setError] = useState<string | null>(null);

    const UPDATE_PROFILE_DATA_KEY = "fertintelligence_update_profile_data";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const profile = JSON.parse(sessionStorage.getItem(UPDATE_PROFILE_DATA_KEY)||"")
        console.log(profile)
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });
        setError(null);
    };

    const confirmMutation = useMutation({
        mutationFn: (payload: { password: string, repeatPassword: string }) => onConfirm(payload.password, payload.repeatPassword),
        onSuccess: () => {
            console.log("Ação de confirmação (API) executada com sucesso!");
        },
        onError: (err: any) => {
            console.error("Erro na confirmação:", err);
            const errorMessage = err.response?.data?.message || "Erro ao executar a ação. Verifique a senha e tente novamente.";
            setError(errorMessage);
        }
    });

    const handleConfirmClick = () => {
        const { senha, senhaRepetida } = passwordForm;

        // Validação da senha atual/nova
        if (!senha) {
            setError("A senha é obrigatória.");
            return;
        }

        // Validação para nova senha (se for o caso)
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
        
        confirmMutation.mutate({ password: senha, repeatPassword: senhaRepetida });
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

                    <VStack spacing={4} align="stretch">
                        {(error || (confirmMutation.isError && !error)) && (
                            <Alert status="error" borderRadius="md" variant="subtle">
                                <Box flex="1">
                                    <Text fontWeight="bold" fontSize="sm">
                                        {error || "Houve um erro inesperado. Tente novamente."}
                                    </Text>
                                </Box>
                            </Alert>
                        )}

                        <Box>
                            <Text textAlign="left" mb={1}>{isNewPassword ? "Nova Senha" : "Senha Atual"}</Text>
                            <PasswordInput
                                name="senha"
                                value={passwordForm.senha}
                                onChange={handleInputChange}
                                placeholder={isNewPassword ? "Digite sua nova senha" : "Digite sua senha atual"}
                                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
                            />
                        </Box>

                        {isNewPassword && (
                            <Box>
                                <Text textAlign="left" mb={1}>Repita a Nova Senha</Text>
                                <PasswordInput
                                    name="senhaRepetida"
                                    value={passwordForm.senhaRepetida}
                                    onChange={handleInputChange}
                                    placeholder="Digite novamente sua nova senha"
                                    _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
                                />
                            </Box>
                        )}

                        <Button
                            onClick={handleConfirmClick}
                            width="full"
                            color="green.700"
                            _hover={{ bg: "green.500", color: "white" }}
                            variant="outline"
                            isLoading={confirmMutation.isLoading}
                            isDisabled={confirmMutation.isLoading}
                        >
                            Concluir
                        </Button>

                        {/* CORREÇÃO: Chama a prop onCancel diretamente. Comentário movido para cima. */}
                        <Button
                            onClick={onCancel} 
                            width="full"
                            color="pink.700"
                            _hover={{ bg: "red.500", color: "white" }}
                            variant="outline"
                            isDisabled={confirmMutation.isLoading}
                        >
                            Cancelar
                        </Button>
                    </VStack>
                </Box>
            </Flex>
        </UserLayout>
    );
}
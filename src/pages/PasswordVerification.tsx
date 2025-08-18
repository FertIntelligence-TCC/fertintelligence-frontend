import { useState } from "react";
import {
    Button,
    VStack,
    Heading,
    Box,
    Text,
    Flex
} from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";

type PasswordVerificationProps = {
    subtitle: string;
    cardHeading: string;
    onConfirm: (password: string, repeatPassword: string) => void;
    onCancel: () => void;
};

export default function PasswordVerification({ subtitle, cardHeading, onConfirm, onCancel }: PasswordVerificationProps) {
    const [passwordForm, setPasswordForm] = useState({
        senha: "",
        senhaRepetida: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });
    };

    const handleConfirmClick = () => {
        onConfirm(passwordForm.senha, passwordForm.senhaRepetida);
    };

    const handleCancelClick = () => {
        onCancel();
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
                        <Box>
                            <Text textAlign="left" mb={1}>Senha</Text>
                            <PasswordInput
                                name="senha"
                                value={passwordForm.senha}
                                onChange={handleInputChange}
                                placeholder="Digite sua senha"
                                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
                            />
                        </Box>

                        <Box>
                            <Text textAlign="left" mb={1}>Repita a senha</Text>
                            <PasswordInput
                                name="senhaRepetida"
                                value={passwordForm.senhaRepetida}
                                onChange={handleInputChange}
                                placeholder="Digite novamente sua senha"
                                _placeholder={{ color: "gray.800", _dark: { color: "gray.400" } }}
                            />
                        </Box>

                        <Button
                            onClick={handleConfirmClick}
                            width="full"
                            color="green.700"
                            _hover={{ bg: "green.500", color: "white" }}
                            variant="outline"
                        >
                            Concluir
                        </Button>

                        <Button
                            onClick={handleCancelClick}
                            width="full"
                            color="pink.700"
                            _hover={{ bg: "red.500", color: "white" }}
                            variant="outline"
                        >
                            Cancelar
                        </Button>
                    </VStack>
                </Box>
            </Flex>
        </UserLayout>
    );
}
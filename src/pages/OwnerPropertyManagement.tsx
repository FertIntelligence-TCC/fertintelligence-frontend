// src/pages/OwnerPropertyManagement.tsx
import React from 'react';
import { Box, Heading, Text, VStack, Flex, Spacer } from '@chakra-ui/react';
import UserLayout from '@/components/Layouts/UserLayout'; //
import FertName from '@/components/FertName/FertName'; //
import ConfigMenu from '@/components/ConfigMenu/ConfigMenu'; //
import { useUserStore } from '@/stores/user/user.store'; // Para verificar cargo
import { Cargo } from '@/interfaces/ServicePayload';

export default function OwnerPropertyManagement() {
    const { user, loading: userLoading } = useUserStore(); // Pega o usuário

    // Verifica se é Proprietário (pode mostrar loading ou acesso negado)
    if (userLoading) {
        return <UserLayout> <Flex justifyContent="center" alignItems="center" minH="100vh"><Spinner size="xl" /></Flex> </UserLayout>;
    }

    if (!user || user.cargo !== Cargo.PROPRIETARIO) { //
        // Reutiliza a UI de acesso restrito para consistência
        return (
            <UserLayout>
                <FertName subtitle="Gerenciar Propriedades" />
                <ConfigMenu />
                <Flex justifyContent="center" alignItems="center" minH="calc(100vh - 150px)">
                    <Box mt={10} p={8} borderWidth={1} borderRadius="md" boxShadow="md" w={{ base: "90%", md: "50%" }} textAlign="center" bg="bg-surface">
                        <Heading as="h2" size="md">Acesso Restrito</Heading>
                        <Text mt={4}> Apenas usuários com o cargo 'Proprietário' podem acessar esta página. </Text>
                    </Box>
                </Flex>
            </UserLayout>
        );
    }

    // Renderização simples para o Proprietário
    return (
        <UserLayout>
            {/* Cabeçalho padrão */}
            <FertName subtitle="Gerenciar Propriedades" />
            <ConfigMenu />

            {/* Conteúdo Principal Simples */}
            <VStack spacing={6} align="stretch" p={5} mt={20}> {/* mt adicionado para espaçar do header */}
                <Heading as="h2" size="lg">
                    Minhas Propriedades
                </Heading>

                <Text>
                    Aqui será exibida a lista das suas propriedades cadastradas.
                </Text>

                <Text>
                    Funcionalidades como adicionar, visualizar, editar e deletar
                    propriedades serão implementadas nesta seção.
                </Text>

                {/* Pode adicionar um botão de placeholder se quiser */}
                {/* <Button colorScheme="green" isDisabled>Adicionar Propriedade (Em breve)</Button> */}

            </VStack>
             {/* ToggleTheme está no UserLayout */}
        </UserLayout>
    );
}
// src/pages/OthersPropertyManagement.tsx
import React from 'react';
import { Box, Heading, Text, VStack, Flex, Spacer } from '@chakra-ui/react';
import UserLayout from '@/components/Layouts/UserLayout'; //
import FertName from '@/components/FertName/FertName'; //
import ConfigMenu from '@/components/ConfigMenu/ConfigMenu'; //

export default function OthersPropertyManagement() {
    return (
        <UserLayout>
            {/* Cabeçalho padrão */}
            <FertName subtitle="Gerenciar Propriedades" />
            <ConfigMenu />

            {/* Conteúdo Principal Simples */}
            <Flex justifyContent="center" alignItems="center" minH="calc(100vh - 150px)">
                <Box
                    mt={10} p={8} borderWidth={1} borderRadius="md" boxShadow="md"
                    w={{ base: "90%", md: "50%" }}
                    textAlign="center" bg="bg-surface" // Cor do tema
                >
                    <Heading as="h2" size="md">Acesso Restrito</Heading>
                    <Text mt={4}>
                        Apenas usuários com o cargo 'Proprietário' podem gerenciar propriedades nesta seção.
                    </Text>
                    {/* Pode adicionar um botão de voltar se desejar */}
                    {/* <Button mt={6} onClick={() => window.history.back()}>Voltar</Button> */}
                </Box>
            </Flex>
            {/* ToggleTheme está no UserLayout */}
        </UserLayout>
    );
}
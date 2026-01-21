import { ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";

type DialogContainerProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    zIndex?: number; // Nova prop opcional
};

const DialogContainer = ({ isOpen, onClose, children, zIndex = 1000 }: DialogContainerProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Flex
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            zIndex={zIndex} // Usa o zIndex passado ou o padrão 1000
            justify="center"
            align="center"
            p={4}
            onClick={onClose}
        >
            <Box
                w="full"
                maxW="lg"
                bg={{ base: "white", _dark: "gray.800" }}
                borderRadius="lg"
                boxShadow="2xl"
                p={6}
                onClick={(event) => event.stopPropagation()}
                maxH="90vh"
                overflowY="auto"
            >
                {children}
            </Box>
        </Flex>
    );
};

export default DialogContainer;
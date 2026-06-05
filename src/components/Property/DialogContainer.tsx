import { ReactNode, useEffect, useState } from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

type DialogContainerProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    zIndex?: number; // Nova prop opcional
    expandable?: boolean;
};

const DialogContainer = ({ isOpen, onClose, children, zIndex = 1000, expandable = false }: DialogContainerProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsExpanded(false);
    }, [isOpen]);

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
                maxW={isExpanded ? "80vw" : "lg"}
                h={isExpanded ? "80vh" : "auto"}
                bg={{ base: "white", _dark: "gray.800" }}
                borderRadius="lg"
                boxShadow="2xl"
                p={6}
                pt={expandable ? 12 : 6}
                onClick={(event) => event.stopPropagation()}
                maxH={isExpanded ? "80vh" : "90vh"}
                overflowY="auto"
                position="relative"
            >
                {expandable && (
                    <IconButton
                        aria-label={isExpanded ? "Reduzir painel" : "Expandir painel"}
                        size="sm"
                        variant="ghost"
                        position="absolute"
                        top={3}
                        right={3}
                        onClick={(event) => {
                            event.stopPropagation();
                            setIsExpanded((current) => !current);
                        }}
                    >
                        {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
                    </IconButton>
                )}
                {children}
            </Box>
        </Flex>
    );
};

export default DialogContainer;

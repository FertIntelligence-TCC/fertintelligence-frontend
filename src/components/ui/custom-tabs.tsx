import React, { createContext, useContext, useState } from "react";
import { Box, Flex, BoxProps, FlexProps } from "@chakra-ui/react";

// Contexto para guardar a aba ativa
const TabsContext = createContext<{ activeTab: number; setActiveTab: (index: number) => void }>({
  activeTab: 0,
  setActiveTab: () => {},
});

export const Tabs = ({ children, defaultIndex = 0, ...props }: BoxProps & { defaultIndex?: number }) => {
  const [activeTab, setActiveTab] = useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <Box w="100%" {...props}>
        {children}
      </Box>
    </TabsContext.Provider>
  );
};

export const TabList = ({ children, ...props }: FlexProps) => {
  return (
    <Flex borderBottomWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} gap={2} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        // Injetamos automaticamente o 'index' em cada Tab
        return React.cloneElement(child as React.ReactElement<any>, { index });
      })}
    </Flex>
  );
};

export const Tab = ({ children, index, ...props }: BoxProps & { index?: number }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === index;
  
  return (
    <Box
      as="button"
      px={4}
      py={2}
      fontWeight="medium"
      borderBottomWidth="2px"
      borderColor={isActive ? "green.500" : "transparent"}
      color={isActive ? "green.600" : "gray.500"}
      _dark={{
        color: isActive ? "green.400" : "gray.400",
        borderColor: isActive ? "green.400" : "transparent"
      }}
      _hover={{ bg: "gray.50", _dark: { bg: "whiteAlpha.50" } }}
      onClick={() => index !== undefined && setActiveTab(index)}
      transition="all 0.2s"
      cursor="pointer"
      marginBottom="-1px" // Faz a borda sobrepor a linha do TabList
      {...props}
    >
      {children}
    </Box>
  );
};

export const TabPanels = ({ children, ...props }: BoxProps) => {
  return (
    <Box pt={4} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child as React.ReactElement<any>, { index });
      })}
    </Box>
  );
};

export const TabPanel = ({ children, index, ...props }: BoxProps & { index?: number }) => {
  const { activeTab } = useContext(TabsContext);
  // Se não for a aba ativa, não renderiza nada
  if (activeTab !== index) return null;
  
  return (
    <Box animation="fade-in 0.2s ease-out" {...props}>
      {children}
    </Box>
  );
};
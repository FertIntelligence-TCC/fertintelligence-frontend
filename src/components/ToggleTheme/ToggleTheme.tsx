import { ClientOnly, Skeleton, IconButton, Box } from "@chakra-ui/react"
import { LuSun, LuMoon } from "react-icons/lu"
import { useColorMode } from "../ui/color-mode"

export const ToggleTheme = () => {
    const { toggleColorMode, colorMode } = useColorMode()
    
    return(
        <Box zIndex={"99999"}>
        <div className="text-right right-bottom">
            <ClientOnly fallback={<Skeleton boxSize="8" />}>
            <IconButton bg={{ base: "white", _dark: "black" }} color={{ base: "black", _dark: "white" }} onClick={toggleColorMode} variant="outline" size="sm">
                {colorMode === "light" ? <LuSun /> : <LuMoon />}
            </IconButton>
            </ClientOnly>
        </div>

        </Box>
    )
}
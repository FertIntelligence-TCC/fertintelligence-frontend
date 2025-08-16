import { ClientOnly, Skeleton, IconButton } from "@chakra-ui/react"
import { LuSun, LuMoon } from "react-icons/lu"
import { useColorMode } from "../ui/color-mode"

export const ToggleThemeXL = () => {
    const { toggleColorMode, colorMode } = useColorMode()
    
    return(
        <div className="text-right right-bottom-s z-9">
            <ClientOnly fallback={<Skeleton boxSize="8" />}>
            <IconButton bg={{ base: "white", _dark: "black" }} color={{ base: "black", _dark: "white" }} onClick={toggleColorMode} variant="outline" size="sm">
                {colorMode === "light" ? <LuSun /> : <LuMoon />}
            </IconButton>
            </ClientOnly>
        </div>
    )
}
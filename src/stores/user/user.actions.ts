import { User } from "../../interfaces/Models";

export type UserActions = {
    setUser: (user: User | undefined) => void;
    // setCreatedCampaigns: (campaigns: Campaign[]) => void;
    // setPlayedCampaigns: (campaigns: Campaign[]) => void;
    // setCharacters: (characters: Character[]) => void;
    // setUserSystems: (userSystems: System[]) => void;
};

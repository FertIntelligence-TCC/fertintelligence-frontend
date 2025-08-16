import { create } from "zustand";
import { UserState } from "./user.state";
import { UserActions } from "./user.actions";

export const useUserStore = create<UserState & UserActions>()((set) => ({
    user: undefined,
    // createdCampaigns: [],
    // playedCampaigns: [],
    // characters: [],
    // userSystems: [],
    setUser: (user) => set({ user }),
    // setCreatedCampaigns: (createdCampaigns) => set({createdCampaigns}),
    // setPlayedCampaigns: (playedCampaigns) => set({playedCampaigns}),
    // setCharacters: (characters) => set({characters}),
    // setUserSystems: (userSystems) => set({userSystems}),
}));

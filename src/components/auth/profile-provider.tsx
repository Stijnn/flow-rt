import { createContext, ReactNode, useContext, useState } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { toast } from "sonner";

export interface Details {
  info: Profile;
}

export interface Profile {
  id: string;
  name: string;
  email?: string;
  timezone?: string;
  isVip: boolean;
  isModerator: boolean;
  isBGModerator: boolean;
  isChatBanned: boolean;
  isDedicatedVip: boolean;
  subscriptionType: string;
  canAccessVIP: boolean;
  canAccessDedilab: boolean;
  isServerVIP: boolean;
  server_id?: string;
  avatar?: string;
  beta_tester?: number;
  rank_id?: number;
  onboarding_tutorial_complete?: number;
  verified: boolean;
  can_delete_avatar: boolean;
  team?: string | any;
  university?: string | any;
  identifier?: string;
  hasTeamInvitation: boolean;
  hasAppTokens: boolean;
  opt_in?: number;
  is_sso_connected?: boolean;
  hasReviewedPlatform: boolean;
  subscription_plan?: any;
  dunning_exists?: boolean;
  currency?: string;
}

const ProfileContext = createContext<{
  profile: Profile | null;
  authenticate: (token: string) => Promise<Profile>;
} | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  async function fetchProfileWithToken(token: string) {
    const resp = await fetch("https://labs.hackthebox.com/api/v4/user/info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return ((await resp.json()) as Details).info;
  }

  async function authenticate(token: string) {
    const profile = await fetchProfileWithToken(token);
    if (profile) {
      setUserProfile(profile);
      toast.success(`Welcome ${profile.name}`, {
        duration: 2000,
      });
    }
    return profile;
  }

  return (
    <ProfileContext.Provider
      value={{
        profile: userProfile,
        authenticate,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);

  if (!ctx) {
    throw new Error("useProfile can only be used within a ProfileProvider");
  }

  return ctx;
};

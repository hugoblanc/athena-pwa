import type { Metadata } from "next";
import { ProfileContent } from "@/components/auth/profile-content";

export const metadata: Metadata = {
  title: "Profil",
  description: "Votre compte Athena : identité, préférences et déconnexion.",
};

export default function ProfilePage() {
  return <ProfileContent />;
}

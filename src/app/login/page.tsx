import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à Athena pour activer vos notifications.",
};

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}

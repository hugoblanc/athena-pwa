import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Athena pour personnaliser votre suivi.",
};

export default function RegisterPage() {
  return <AuthScreen mode="register" />;
}

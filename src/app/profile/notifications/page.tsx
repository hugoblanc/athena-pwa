import type { Metadata } from "next";
import { NotificationsSettings } from "@/components/notif/notifications-settings";

export const metadata: Metadata = {
  title: "Notifications",
  description:
    "Activez ou désactivez les notifications push d'Athena et gérez les médias suivis.",
};

export default function NotificationsPage() {
  return <NotificationsSettings />;
}

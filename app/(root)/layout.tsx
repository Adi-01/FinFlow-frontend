import { UserProvider } from "@/components/providers/user-provider";
import { MonthProvider } from "@/components/providers/month-provider";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { fetchCurrentUser } from "@/lib/services/user.service";

export default async function RootWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchCurrentUser();

  return (
    <UserProvider initialUser={user}>
      <MonthProvider>
        <WorkspaceSidebar>{children}</WorkspaceSidebar>
      </MonthProvider>
    </UserProvider>
  );
}

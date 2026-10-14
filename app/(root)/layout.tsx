import { UserProvider } from "@/components/providers/user-provider";
import { MonthProvider } from "@/components/providers/month-provider";
import { SyncProvider } from "@/components/providers/sync-provider";
import { WorkspaceSidebar } from "./workspace-sidebar";

export default function RootWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <MonthProvider>
        <SyncProvider>
          <WorkspaceSidebar>{children}</WorkspaceSidebar>
        </SyncProvider>
      </MonthProvider>
    </UserProvider>
  );
}

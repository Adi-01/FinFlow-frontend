import { UserProvider } from "@/components/providers/user-provider";
import { MonthProvider } from "@/components/providers/month-provider";
import { WorkspaceSidebar } from "./workspace-sidebar";

export default function RootWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <MonthProvider>
        <WorkspaceSidebar>{children}</WorkspaceSidebar>
      </MonthProvider>
    </UserProvider>
  );
}

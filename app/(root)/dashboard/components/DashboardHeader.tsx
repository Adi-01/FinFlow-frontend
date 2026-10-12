import { useUserContext } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  onAddTransaction: () => void;
}

export function DashboardHeader({ onAddTransaction }: DashboardHeaderProps) {
  const { user } = useUserContext();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            Welcome {user?.name.split(" ")[0] || "User"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Monthly Financial Overview
          </p>
        </div>
      </div>

      <Button
        onClick={onAddTransaction}
        size="sm"
        className="gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
      >
        <Plus className="size-4" />
        Add Transaction
      </Button>
    </div>
  );
}

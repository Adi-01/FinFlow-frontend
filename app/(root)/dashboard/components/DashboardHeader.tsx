import { useUserContext } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  onAddTransaction: () => void;
}

export function DashboardHeader({ onAddTransaction }: DashboardHeaderProps) {
  const { user, isLoading } = useUserContext();

  const firstName = user?.name ? user.name.trim().split(" ")[0] : null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2 min-h-[28px]">
            <span>Welcome</span>
            {isLoading || !firstName ? (
              <span className="inline-block h-5 w-20 rounded-md bg-muted shimmer shimmer-bg align-middle" />
            ) : (
              <span>{firstName}</span>
            )}
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

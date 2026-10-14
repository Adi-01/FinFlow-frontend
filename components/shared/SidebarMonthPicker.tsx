"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MonthYearWheelPicker } from "@/components/shared/MonthYearWheelPicker";
import { useMonthContext } from "@/components/providers/month-provider";
import { formatMonthYear } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function SidebarMonthPicker() {
  const { year, month, setYearMonth } = useMonthContext();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const formattedMonth = formatMonthYear(year, month);

  const handleApply = (newYear: number, newMonth: number) => {
    setYearMonth(newYear, newMonth);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.05] cursor-pointer group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-1.5 group-data-[state=collapsed]/sidebar:py-1.5 shadow-none"
          title={`Active Month: ${formattedMonth}`}
        >
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Calendar className="h-4 w-4 shrink-0 text-foreground/50 hover:text-foreground" />
            <span className="truncate group-data-[state=collapsed]/sidebar:hidden font-medium">
              {formattedMonth}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-data-[state=collapsed]/sidebar:hidden" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card border-border shadow-lg z-50"
        align={isMobile ? "center" : "start"}
        side={isMobile ? "bottom" : "right"}
        sideOffset={8}
        collisionPadding={12}
      >
        <MonthYearWheelPicker
          year={year}
          month={month}
          onApply={handleApply}
          onCancel={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

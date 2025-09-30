import { useState } from "react";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { formatDate } from "../../../../../lib/utils";

export function DatePicker({ dateFilter, setDateFilter }) {
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  return (
    <div className="flex justify-center items-center gap-3 w-full lg:w-auto">
      <Popover className="w-1/2 lg:w-auto"  open={openStartDate} onOpenChange={setOpenStartDate}>
        FROM:
        <PopoverTrigger  asChild>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal"
          >
            {dateFilter.startDate ? formatDate(dateFilter.startDate) : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
 
        <PopoverContent
          className="w-auto overflow-hidden  p-0"
          align="center"
        >
          <Calendar
            mode="single"
            selected={dateFilter}
            className="gap-6"
            captionLayout="dropdown"
            onSelect={(date) => {
              setDateFilter({...dateFilter, startDate:date});
              setOpenStartDate(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Popover className="w-1/2 lg:w-auto"  open={openEndDate} onOpenChange={setOpenEndDate}>
        TO:
        <PopoverTrigger  asChild>
          <Button
            variant="outline"
            id="date"
            className=" justify-between font-normal"
          >
            {dateFilter.endDate ? formatDate(dateFilter.endDate) : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden  p-0"
          align="center"
        >
          <Calendar
            mode="single"
            selected={dateFilter}
            className="gap-6"
            captionLayout="dropdown"
            onSelect={(date) => {
              setDateFilter({...dateFilter, endDate:date});
              setOpenEndDate(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

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

export function SaleDatePicker({ inputs, setInputs }) {
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  return (
    <div className="flex justify-center items-center gap-3 w-full lg:w-auto">
      <Popover
        className="w-1/2 lg:w-auto"
        open={openStartDate}
        onOpenChange={setOpenStartDate}
      >
        FROM:
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal"
          >
            {inputs.startDate ? formatDate(inputs.startDate) : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden  p-0" align="center">
          <Calendar
            mode="single"
            selected={inputs.startDate}
            className="gap-6"
            captionLayout="dropdown"
            onSelect={(date) => {
              setInputs((prev) => {
                return { ...prev, startDate: date };
              });
              setOpenStartDate(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Popover
        className="w-1/2 lg:w-auto"
        open={openEndDate}
        onOpenChange={setOpenEndDate}
      >
        TO:
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className=" justify-between font-normal"
          >
            {inputs.endDate
              ? formatDate(inputs.endDate)
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden  p-0" align="center">
          <Calendar
            mode="single"
            selected={inputs.endDate}
            className="gap-6"
            captionLayout="dropdown"
            onSelect={(date) => {
              setInputs((prev) => {
                return { ...prev, endDate: date };
              });
              setOpenEndDate(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

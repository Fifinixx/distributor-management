import { useState } from "react";
import ShopsComboBox from "../../shops-combobox";
import { SaleDatePicker } from "./sale-date-picker";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { BsFillFilterSquareFill } from "react-icons/bs";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SaleHistoryFilters({
  shops,
  setShops,
  setPage,
  inputs,
  setInputs,
  resetFilters,
  fetchOrders,
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button onClick={() => setOpen(true)} variant="outline" className="w-full lg:w-auto">
          <BsFillFilterSquareFill />FILTERS
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col container justify-center gap-6 items-center w-full ">
            <ShopsComboBox inputs={inputs} setInputs={setInputs} shops={shops} setShops={setShops} />
            <div className="flex justify-center items-center gap-4 w-full lg:w-auto">
              <div className="flex justify-center items-center gap-2">
                <Checkbox
                  checked={inputs.paid}
                  id="paid"
                  onCheckedChange={(checked) => setInputs(prev => {
                    return {...prev, paid:checked === true}
                  })}
                />
                <Label htmlFor="paid">PAID</Label>
              </div>
              <div className="flex justify-center items-center gap-2 ">
                <Checkbox
                  checked={inputs.unPaid}
                  id="unpaid"
                  onCheckedChange={(checked) => setInputs(prev => {
                    return {...prev, unPaid:checked === true}
                  })}
                />
                <Label htmlFor="unpaid">UNPAID</Label>
              </div>
            </div>
            <SaleDatePicker
              inputs={inputs}
              setInputs={setInputs}
            />
          </div>
          <SheetFooter>
              <Button onClick={resetFilters} variant="outline">Clear</Button>
            <Button
              onClick={() => {
                fetchOrders();
                setOpen(false);
              }}
              type="button"
            >
              GO
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

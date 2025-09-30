import { useState } from "react";
import { CompanyComboBox } from "../../companies-combobox";
import { DatePicker } from "./date-picker";

import { Button } from "@/components/ui/button";
import { BsFillFilterSquareFill } from "react-icons/bs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Check } from "lucide-react";

export default function HistoryFilters({
  suppliers,
  setSuppliers,
  setPage,
  filterBySupplier,
  setFilterBySupplier,
  setInputs,
  products,
  dateFilter,
  setDateFilter,
  setFilters,
  paidFilter,
  unPaidFilter,
  setPaidFilter,
  setUnpaidFilter,
  resetFilters,
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
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Filter your products</SheetDescription>
          </SheetHeader>
          <div className="flex p-2 flex-col container justify-center gap-6 items-center w-full">
            <CompanyComboBox
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              setPage={setPage}
              filterBySupplier={filterBySupplier}
              setFilterBySupplier={setFilterBySupplier}
              setInputs={setInputs}
              products={products}
            />
            <div className="flex  justify-center items-center gap-4 w-full ">
              <div className="flex justify-center items-center gap-2">
                <Checkbox
                  checked={paidFilter}
                  id="paid"
                  onCheckedChange={setPaidFilter}
                />
                <Label htmlFor="paid">PAID</Label>
              </div>
              <div className="flex justify-center items-center gap-2 ">
                <Checkbox
                  checked={unPaidFilter}
                  id="unpaid"
                  onCheckedChange={setUnpaidFilter}
                />
                <Label htmlFor="unpaid">UNPAID</Label>
              </div>
            </div>
            <DatePicker dateFilter={dateFilter} setDateFilter={setDateFilter} />
            <Button
              className="w-full "
              variant="outline"
              onClick={resetFilters}
            >
              CLEAR FILTERS
            </Button>
            <Button className="w-full" onClick={() => {setFilters(); setOpen(false)}}>
              GO
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

import { useState, useEffect } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { toast } from "sonner";

import { SupplierList } from "../services/suppliers";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "../../ui/shadcn-io/spinner/index";
import { capitalize } from "../../../lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CompanyComboBox({
  suppliers,
  setSuppliers,
  text,
  setPage,
  filterBySupplier,
  setFilterBySupplier,
  setInputs,
  products,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  async function fetchSuppliers() {
    setLoading(true);
    try {
      const res = await SupplierList(1, "", false);
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers);
        setLoading(false);
      } else {
        toast.error("Error while fetching suppliers");
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Server error while fetching suppliers");
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchSuppliers();
  }, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full lg:w-auto justify-between m-0"
        >
          <span className="opacity-50">
            {filterBySupplier?.id
              ? capitalize(filterBySupplier.name)
              : text
              ? text
              : "SELECT A SUPPLIER"}
          </span>

          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
        {loading ? (
          <span className="flex justify-center p-2">
            <Spinner />
          </span>
        ) : (
          <Command>
            <CommandList>
              <CommandEmpty>No Company found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={(e) => {
                    setOpen(false);
                    {
                      setPage && setPage(1);
                    }
                    setFilterBySupplier({ id: "", name: "" });
                    {
                      setInputs &&
                        setInputs((prev) => {
                          return {
                            ...prev,
                            companyName: "",
                            supplier_id: "",
                            product_id: "",
                            productName: "",
                            productId: "",
                          };
                        });
                    }
                  }}
                >
                  {text ? text : "SELECT SUPPLIER"}
                </CommandItem>
                {suppliers?.map((supplier) => (
                  <CommandItem
                    key={supplier._id}
                    onSelect={() => {
                      setOpen(false);
                      {
                        setPage && setPage(1);
                      }
                      setFilterBySupplier({
                        id: supplier._id,
                        name: supplier.name,
                      });
                      {
                        setInputs &&
                          setInputs((prev) => {
                            return {
                              ...prev,
                              companyName: supplier.name,
                              supplier_id: supplier._id,
                            };
                          });
                      }
                    }}
                  >
                    {capitalize(supplier.name)}
                    <Check
                      className={cn(
                        "ml-auto",
                        filterBySupplier === supplier._id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

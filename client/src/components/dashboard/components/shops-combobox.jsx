import { useState, useEffect } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { toast } from "sonner";

import { Spinner } from "../../ui/shadcn-io/spinner/index";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

import { ShopList } from "../services/shops";
import { capitalize } from "../../../lib/utils";

export default function ShopsComboBox({ inputs, setInputs, shops, setShops }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  async function fetchShops() {
    setValue("");
    setLoading(true);
    try {
      const res = await ShopList(1, "", search, false);
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops);
        setLoading(false);
      } else {
        toast.error("Error while fetching shops");
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Server error while fetching shops");
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchShops();
  }, [search]);
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full min-w-48 sm:w-auto"
          >
            {loading ? (
              <span className="flex justify-center">
                <Spinner />
              </span>
            ) : (
              <>
                <span className="opacity-50">
                  {inputs.shopName
                    ? capitalize(shops.find((shop) => shop.name === value)?.name)
                    : "SELECT A SHOP"}
                </span>
                <ChevronsUpDown className="opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className=" p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No Shops Found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={(e) => {
                    setValue("");
                    setOpen(false);
                    {
                      setInputs &&
                      setInputs((prev) => {
                          return {
                            ...prev,
                            shopName: "",
                            shop_id:"",
                          };
                        });
                    }
                  }}
                >
                  {"SELECT SHOP"}
                </CommandItem>
                {shops.map((shop) => (
                  <CommandItem
                    key={shop._id}
                    value={shop.name}
                    onSelect={(currentValue) => {
                      {
                        setInputs &&
                        setInputs((prev) => {
                            return {
                              ...prev,
                              shopName: shop.name,
                              shop_id: shop._id,
                            };
                          });
                      }
                      setValue(currentValue === value ? value : currentValue);
                      setOpen(false);
                    }}
                  >
                    {capitalize(shop.name)}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === shop.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}

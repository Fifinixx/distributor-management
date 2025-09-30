import { useState, useEffect } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { toast } from "sonner";

import { Spinner } from "../../ui/shadcn-io/spinner/index";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { trimName, formatCurrency,capitalize } from "../../../lib/utils";
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

import { ProductList } from "../services/products";

export default function ProductsComboBox({
  products,
  setProducts,
  filterBySupplier,
  setInputs,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  async function fetchProducts() {
    setValue("");
    setLoading(true);
    try {
      const res = await ProductList(1, "", filterBySupplier);
      if (res.ok) {
        const data = await res.json();
        if (filterBySupplier) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
        setLoading(false);
      } else {
        toast.error("Error while fetching products");
        setLoading(false);
      }
    } catch (e) {
      toast.error(e);
    }
  }
  useEffect(() => {
    fetchProducts();
  }, [filterBySupplier]);
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full min-w-48 sm:w-auto"
            disabled={products.length === 0 || filterBySupplier.id === "" || loading}
          >
            {loading ? (
              <span className="flex justify-center">
                <Spinner />
              </span>
            ) : (
              <>
                <span className="opacity-50">
                  {value
                    ? capitalize(trimName(
                        products.find((product) => product.name === value)?.name
                      ))
                    : "PRODUCTS"}
                </span>
                <span>
                  {value
                    ? trimName("Stock: "+
                        products.find((product) => product.name === value)
                          ?.stock
                      )
                    : ""}
                </span>
                <span>
                  {value
                    ? ("Price: "+
                        formatCurrency(products.find((product) => product.name === value)
                          ?.avgPrice.$numberDecimal)
                      )
                    : ""}
                </span>
                <ChevronsUpDown className="opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className=" p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No Products Found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={(e) => {
                    setValue("");
                    setOpen(false);
                    setInputs(prev => {return {...prev, price:"", qty:""}})
                  }}
                >SELECT PRODUCTS</CommandItem>
                {products.map((product) => (
                  <CommandItem
                    key={product._id}
                    value={product.name}
                    className="flex justify-between"
                    onSelect={(currentValue) => {
                      {
                        setInputs &&
                          setInputs((prev) => {
                            return {
                              ...prev,
                              product_id: product._id,
                              productId: product.id,
                              productName: product.name,
                              gst:product.gst
                            };
                          });
                      }
                      setValue(currentValue === value ? value : currentValue);
                      setOpen(false);
                    }}
                  >
                    {
                      <span className="flex justify-between w-full">
                        <span className="w-[50%]">{capitalize(trimName(product.name))} </span>
                        <span className="w-[25%]"> S: {product.stock}</span>
                        <span  className="w-[25%]"> P: {formatCurrency(product.avgPrice.$numberDecimal)}</span>
                      </span>
                    }
                    <Check
                      className={cn(
                        "",
                        value === product.name ? "opacity-100" : "opacity-0"
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

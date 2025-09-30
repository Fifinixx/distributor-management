import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

import { CompanyComboBox } from "../companies-combobox";

export function AddProductDialog({ ...props }) {
  const [suppliers, setSuppliers] = useState([]);
  const [filterBySupplier, setFilterBySupplier] = useState({
    id: "",
    name: "",
  });

  return (
    <>
      <Button
        type="button"
        onClick={() => props.setAddProductModal(true)}
        variant="outline"
        className="w-full lg:w-auto"
      >
        ADD PRODUCT
      </Button>

      <Dialog
        open={props.addProductModal}
        onOpenChange={props.setAddProductModal}
      >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>ADD PRODUCT</DialogTitle>
              <DialogDescription>
                Add a new Product with a company name and a product name
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <CompanyComboBox
                  suppliers={suppliers}
                  setSuppliers={setSuppliers}
                  filterBySupplier={filterBySupplier}
                  setFilterBySupplier={setFilterBySupplier}
                  text="SELECT A SUPPLIER"
                />
              </div>
              <div className="grid gap-3">
                <Input
                  id="name"
                  name="name"
                  placeholder="Product Name"
                  onChange={(e) =>
                    props.setAddSupplierInput((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Input
                  id="GST"
                  type="number"
                  name="GST"
                  placeholder="GST"
                  onChange={(e) =>
                    props.setAddSupplierInput((prev) => {
                      return { ...prev, gst: e.target.value };
                    })
                  }
                />
                <Input
                  id="MRP"
                  type="number"
                  name="MRP"
                  placeholder="MRP"
                  onChange={(e) =>
                    props.setAddSupplierInput((prev) => {
                      return { ...prev, mrp: e.target.value };
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter className="relative">
              <DialogClose asChild>
                <Button
                  onClick={() => props.setAddProductModal((prev) => !prev)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={props.addProductLoading}
                type="button"
                onClick={(e) => props.addProduct(e, filterBySupplier)}
              >
                {props.addProductLoading ? <Spinner /> : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}

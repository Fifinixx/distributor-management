import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea"

export function AddSupplierDialog({
  input,
  setInput,
  AddSuppliers,
  loadingAdd,
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Supplier</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new Suplier</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Input
              id="name"
              name="name"
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder="Add a new supplier name"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={(e) => {
              AddSuppliers(e, input);
            }}
          >
            {loadingAdd ? <Spinner /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

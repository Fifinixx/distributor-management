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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function AddShopDialog({ input, setInput, addShops, loadingAdd }) {
  function isValidMobile(value) {
    if (typeof value !== "string") return false;
    return /^(\+91[\-\s]?|0)?[6-9]\d{9}$/.test(value.trim());
  }
  function checkInputs(input) {
    let error = 0;
    if (!input.name || input.name === "" || input.name === undefined) {
      toast.error("Enter valid name");
      error = 1;
      return;
    }
    if (!isValidMobile(input.contact)) {
      toast.error("Enter valid contact");
      error = 1;
      return;
    }
    if (
      input.address.length < 5 ||
      input.address === "" ||
      input.address === undefined
    ) {
      toast.error("Enter valid address");
      error = 1;
      return;
    }
    return error;
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Shop</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new Shop</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Input
              id="name"
              name="name"
              onChange={(e) => {
                setInput((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder="Add a new shop name"
            />
          </div>
          <Input
            id="contact"
            name="contact"
            type="number"
            onChange={(e) => {
              setInput((prev) => ({ ...prev, contact: e.target.value }));
            }}
            placeholder="Add contact"
          />
          <Textarea
            placeholder="Address"
            onChange={(e) => {
              setInput((prev) => ({ ...prev, address: e.target.value }));
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={(e) => {
              if(checkInputs(input) === 0){
                addShops(e, input);
              }
            }}
          >
            {loadingAdd ? <Spinner /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

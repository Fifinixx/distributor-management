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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Spinner } from "../../../ui/shadcn-io/spinner";

import { RiFileDamageFill } from "react-icons/ri";

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;

export default function DamageGoodsDialog({ _id, fetchProducts }) {
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState("");
  async function recordDamage() {
    if (!Number(qty)) {
      toast.error("Please set qty");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/dashboard/damage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: _id, qty: Number(qty) }),
        credentials: "include",
      });
      if (res.ok) {
        setLoading(false);
        toast.success("Damage succesfully recorded.");
      } else {
        setLoading(false);
        toast.error("Failed to record damage.");
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      toast.error("Failed to record damage");
    }
  }
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            className="cursor-pointer  hover:text-red-600"
            variant="outline"
          >
            <RiFileDamageFill />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record damaged goods</DialogTitle>
            <DialogDescription>
              Record goods that has been damaged.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Label htmlFor="qty">Qty</Label>
            <Input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              id="qty"
              name="qty"
              type="number"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={loading} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={async () => {
                await recordDamage();
                fetchProducts();
              }}
              disabled={loading}
              type="submit"
            >
              {loading ? <Spinner /> : "Record Damage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

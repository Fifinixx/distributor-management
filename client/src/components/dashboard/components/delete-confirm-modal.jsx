import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "../../ui/shadcn-io/spinner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmModal({ deleteOrders, ids, text, icon, variant }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <Button
          onClick={() => {
            if (ids.length === 0) {
              toast.error("No orders selected");
            }else{
              setOpen(true);
            }
          }}
          variant="outline"
          type="button"
          className={`cursor-pointer  hover:text-red-600 ${variant === "single" ? "" : "w-full lg:w-auto"}`}
        >
          {icon}
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>{text}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                await deleteOrders(ids);
                setLoading(false);
                setOpen(false);
              }}
            >
              {loading ? <Spinner /> : "Yes"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useState } from "react";
import { PiInvoice } from "react-icons/pi";
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

import { PDFViewer } from "@react-pdf/renderer";
import Invoice from "./invoice";

export function InvoiceModal({ order }) {
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  return (
    <Dialog open={openInvoiceDialog} onOpenChange={setOpenInvoiceDialog}>
      <DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogTitle>
      <Button type="button" onClick={() => setOpenInvoiceDialog(true)}>
        <PiInvoice />
      </Button>
      <DialogContent className="max-w-none w-[90vw] h-[90vh] sm:max-w-[794px]">
        <PDFViewer width="100%" height="100%">
          <Invoice order={order} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}

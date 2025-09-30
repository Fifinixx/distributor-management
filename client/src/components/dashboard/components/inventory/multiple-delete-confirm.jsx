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
export default function MultipleDeleteModal({
  deleteProducts,
  markForDeletion,
  multipleDeleteConfirmModal,
  setMultipleDeleteConfirmModal,
  multipleDeleteloading,
}) {
  return (
    <>
      <Button
        type="button"
        onClick={() => {
          markForDeletion.length === 0
            ? toast("No products selected!")
            : setMultipleDeleteConfirmModal(true);
        }}
        className="w-1/2  lg:w-auto m-0"
      >
        DELETE SELECTED
      </Button>
      <Dialog
        open={multipleDeleteConfirmModal}
        onOpenChange={setMultipleDeleteConfirmModal}
      >
        <form>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Products</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete selected products?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setMultipleDeleteConfirmModal(false)}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
                {multipleDeleteloading ? (
                  <Button>
                    <Spinner />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => deleteProducts(e, markForDeletion)}
                  >
                    Yes
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
}

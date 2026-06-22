"use client";

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

export function ConfirmDeleteDialog({
  triggerLabel,
  title,
  description,
  formAction,
  children,
  confirmLabel = "Delete",
}: {
  triggerLabel: string;
  title: string;
  description: string;
  formAction: (formData: FormData) => void | Promise<void>;
  children?: React.ReactNode;
  confirmLabel?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {children}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" variant="destructive">
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

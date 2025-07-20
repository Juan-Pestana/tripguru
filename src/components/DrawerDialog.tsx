"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMedieQuery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import PopupComponent from "./PopupComponent";
import { Spinner } from "./ui/spinner";
//import { Label } from "@/components/ui/label";

interface DrawerDialogDemoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: any; // Use the correct type for your station details
  isLoading: boolean;
  error: Error | null;
}

export function DrawerDialogDemo({
  open,
  onOpenChange,
  station,
  isLoading,
  error
}: DrawerDialogDemoProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          {station && <PopupComponent station={station} />}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>

        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Spinner message="Loading station details..." />
          </div>
        )}
        {error && (
          <div className="text-red-500">
            Error loading station details: {error.message}
          </div>
        )}
        {station && (
          <div className="mx-auto">
            <PopupComponent station={station} />
          </div>
        )}

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  return (
    <form className={cn("grid items-start gap-6", className)}>
      <div className="grid gap-3">
        {/* <Label htmlFor="email">Email</Label> */}
        <Input type="email" id="email" defaultValue="shadcn@example.com" />
      </div>
      <div className="grid gap-3">
        {/* <Label htmlFor="username">Username</Label> */}
        <Input id="username" defaultValue="@shadcn" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}

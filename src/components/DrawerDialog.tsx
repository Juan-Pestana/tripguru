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
import { POIwDetails } from "@/hooks/usePOIs";
import { MapPin } from "lucide-react";
//import { Label } from "@/components/ui/label";

interface DrawerDialogDemoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station?: POIwDetails | null; // Use the correct type for your station details
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
            <DialogTitle>{station?.name}</DialogTitle>
            <DialogDescription>
              {station?.details.address}, {station?.details.city},{" "}
              {station?.type === "service_station" &&
                `${station?.details.province}, ${station?.details.postalCode} `}
            </DialogDescription>
          </DialogHeader>
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
            <div className="w-full">
              <PopupComponent station={station} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left pb-0">
          <DrawerTitle>{station?.name}</DrawerTitle>
          <DrawerDescription>
            {station?.details.address}, {station?.details.city},{" "}
            {station?.type === "service_station" &&
              `${station?.details.postalCode}, ${station?.details.province}`}
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
          <div className="w-full">
            <PopupComponent station={station} />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { BiError } from "react-icons/bi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex justify-center items-center flex-col gap-5 h-screen">
      <p className="text-6xl text-primary">
        <BiError />
      </p>
      <p className="text-3xl font-semibold">Something went wrong!</p>
      <Button variant={"outline"} onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}

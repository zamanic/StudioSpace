"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    toast.success("You are on the list.", {
      description: "We will email you when new studios open near you.",
    });
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
      <Input
        type="email"
        name="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@studio.com"
        aria-label="Email address for the newsletter"
        className="h-9 bg-background/60"
      />
      <Button type="submit" size="lg" className="shrink-0" aria-label="Subscribe">
        <ArrowRightIcon />
      </Button>
    </form>
  );
}

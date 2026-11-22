import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/aura/shell";

export const Route = createFileRoute("/")({
  component: Shell,
});

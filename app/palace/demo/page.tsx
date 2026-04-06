"use client";

import { useRouter } from "next/navigation";
import { PalaceRoom } from "@/components/palace/palace-room";
import { GEUNJEONGJEON_ROOM } from "@/lib/data/palace-rooms/geunjeongjeon";

export default function PalaceDemoPage() {
  const router = useRouter();
  return <PalaceRoom room={GEUNJEONGJEON_ROOM} onBack={() => router.push("/palace")} />;
}

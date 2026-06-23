// src/app/(marketing)/kitchen/page.tsx
import { Suspense } from "react";
import Kitchen from "./kitchen"; // this file

export default function KitchenPage() {
  return (
    <Suspense>
      <Kitchen />
    </Suspense>
  );
}
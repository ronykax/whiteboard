import { Canvas } from "@/components/canvas";
import { db } from "@/db";
import { notesTable } from "@/db/schema";

export const dynamic = "force-dynamic";

const Page = async () => {
  const notes = await db.select().from(notesTable);
  return <Canvas initialNotes={notes} />;
};

export default Page;

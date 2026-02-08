import { getSession } from "@/lib/auth/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { uploadAvatar } from "@/lib/r2";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file") ?? formData.get("avatar");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Use field 'file' or 'avatar'." },
      { status: 400 }
    );
  }

  const contentType = file.type || "application/octet-stream";
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadAvatar(
    session.user.id,
    buffer,
    contentType,
    file.name
  );

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  await db
    .update(users)
    .set({
      imageUrl: result.url,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ imageUrl: result.url });
}

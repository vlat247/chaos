import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);

  // Diagnostic: Try to delete matching by either raw string ID or numeric ID
  // This handles cases where Supabase expects one or the other.
  const query = supabase.from("notes").delete().eq("user_id", user.id);
  
  if (!isNaN(numericId)) {
    query.or(`id.eq.${id},id.eq.${numericId}`);
  } else {
    query.eq("id", id);
  }

  const { data, error, count } = await query.select();

  if (error) {
    console.error("Supabase DELETE error:", error);
    return NextResponse.json({ 
      error: error.message, 
      code: error.code,
      details: error.details,
      diag: { id, numericId, userId: user.id }
    }, { status: 500 });
  }

  if (!data || data.length === 0) {
    console.log(`Deletion failed: No note found. Diag: id=${id}, user=${user.id}`);
    return NextResponse.json({ 
      error: "Note not found or no permission", 
      diag: { id, numericId, userId: user.id }
    }, { status: 404 });
  }

  return NextResponse.json({ success: true, deleted: data[0] });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.content !== undefined) updates.content = body.content;
  if (body.is_pinned !== undefined) updates.is_pinned = body.is_pinned;
  if (body.is_public !== undefined) updates.is_public = body.is_public;

  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    console.error("Supabase PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

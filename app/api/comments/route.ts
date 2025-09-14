import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// POST /api/comments - Create a new comment
export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { post_id, content } = await req.json();

    if (!post_id || !content) {
      return NextResponse.json({ error: "Post ID and content are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: post_id,
        author_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (!error) {
      await supabase.from("logs").insert({
        user_id: user.id,
        event_type: "COMMENT_CREATED",
        entity_id: data.id,
        details: { post_id: data.post_id, content: data.content },
      });
    }

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/comments?post_id=[id] - Get comments for a specific post
export async function GET(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(req.url);
    const post_id = searchParams.get("post_id");

    if (!post_id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(display_name, avatar_url)")
      .eq("post_id", post_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

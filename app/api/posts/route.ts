import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, slug, content, main_image_url, published } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Title, slug, and content are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        main_image_url: main_image_url.trim() || null,
        published,
      })
      .select()
      .single();

    if (!error) {
      await supabase.from("logs").insert({
        user_id: user.id,
        event_type: "POST_CREATED",
        entity_id: data.id,
        details: { title: data.title, slug: data.slug, published: data.published, main_image_url: data.main_image_url },
      });
    }

    if (error) {
      console.error("Error creating post:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const authorId = searchParams.get("author_id");
    const published = searchParams.get("published"); // "true" or "false"

    const offset = (page - 1) * limit;

    let query = supabase
      .from("posts")
      .select("*, profiles(display_name, avatar_url)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (authorId) {
      query = query.eq("author_id", authorId);
    }
    if (published !== null) {
      query = query.eq("published", published === "true");
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, page, limit }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

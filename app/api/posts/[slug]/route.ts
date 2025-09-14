import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET /api/posts/[slug] - Get a single post by slug
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = createServerSupabase();
    const { slug } = await params;

    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(display_name, avatar_url)")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching post by slug:", error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/posts/[slug] - Update a post by slug (only by owner)
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = createServerSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { title, content, main_image_url, published } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Ensure the user is the author of the post
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("id, author_id, title, slug, published") // 로그 기록을 위해 필요한 필드 추가
      .eq("slug", slug)
      .single();

    if (fetchError || !existingPost || existingPost.author_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to update this post" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        main_image_url,
        published,
        updated_at: new Date().toISOString(), // Trigger will also update this, but explicit is fine
      })
      .eq("slug", slug)
      .select()
      .single();

    if (!error) {
      await supabase.from("logs").insert({
        user_id: user.id,
        event_type: "POST_UPDATED",
        entity_id: data.id,
        details: {
          old_title: existingPost.title,
          new_title: data.title,
          old_slug: existingPost.slug,
          new_slug: data.slug,
          old_published: existingPost.published,
          new_published: data.published,
        },
      });
    }

    if (error) {
      console.error("Error updating post:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/posts/[slug] - Delete a post by slug (only by owner)
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = createServerSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Ensure the user is the author of the post
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("id, author_id, title, slug") // 로그 기록을 위해 필요한 필드 추가
      .eq("slug", slug)
      .single();

    if (fetchError || !existingPost || existingPost.author_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this post" }, { status: 403 });
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("slug", slug);

    if (!error) {
      await supabase.from("logs").insert({
        user_id: user.id,
        event_type: "POST_DELETED",
        entity_id: existingPost.id,
        details: { title: existingPost.title, slug: existingPost.slug },
      });
    }

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

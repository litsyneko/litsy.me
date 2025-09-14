import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// DELETE /api/comments/[id] - Delete a comment by ID (only by owner or post owner)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the comment to check ownership and post ownership
    const { data: comment, error: fetchCommentError } = await supabase
      .from("comments")
      .select("id, author_id, post_id, content") // 로그 기록을 위해 content 필드 추가
      .eq("id", id)
      .single();

    if (fetchCommentError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if the current user is the comment author
    if (comment.author_id === user.id) {
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);

    if (!deleteError) {
      await supabase.from("logs").insert({
        user_id: user.id,
        event_type: "COMMENT_DELETED",
        entity_id: id,
        details: { post_id: comment.post_id, content: comment.content },
      });
    }

      if (deleteError) {
        console.error("Error deleting comment:", deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
    }

    // If not comment author, check if user is the post author
    const { data: post, error: fetchPostError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", comment.post_id)
      .single();

    if (fetchPostError || !post || post.author_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 });
    }

    // User is post author, allow deletion
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

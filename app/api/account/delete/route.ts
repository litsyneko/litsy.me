import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

/**
 * POST /api/account/delete
 * - Expects Authorization: Bearer <access_token> header from the current session.
 * - Validates the token to obtain the user id, then uses the service-role admin client
 *   to remove profile rows and delete the auth user.
 *
 * Note: This endpoint must run on the server (Edge/Server) and requires
 * the SUPABASE_SERVICE_ROLE_KEY to be set in environment variables.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate token and get user
    const serverSupabase = createServerSupabase(token);
    const { data: userData, error: userErr } = await serverSupabase.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const userId = userData.user.id;

    // Admin client (service role) to perform deletion
    const admin = createAdminSupabase();

    // 1) Delete related rows in `profiles` (if exists)
    try {
      await admin.from("profiles").delete().eq("id", userId).limit(1);
    } catch (e) {
      // continue - absence of table or other issues shouldn't block user deletion
      console.error("profiles delete error:", e);
    }

    // 2) Optionally remove storage files belonging to the user (skipped here).
    //    If you use storage and have a user folder, delete objects via admin.storage.from(bucket).remove([...])

    // 3) Delete auth user via admin API
    // Supabase JS provides admin methods under auth.admin; use the service role client.
    // The exact method name may vary by supabase-js version; try common API.
    // Preferred: admin.auth.admin.deleteUser(userId)
    try {
      const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
      if (deleteErr) {
        console.error("admin deleteUser error:", deleteErr);
        return NextResponse.json({ error: deleteErr.message || "Failed to delete user" }, { status: 500 });
      }
    } catch (e) {
      console.error("admin delete attempt failed:", e);
      return NextResponse.json({ error: "Failed to delete user via admin API" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDiscordUsername } from '@/lib/discord'

type Comment = {
  id: string
  author_name?: string
  author_avatar?: string
  content: string
  created_at: string
}

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/comments?post_id=${postId}`)
      if (!res.ok) { setComments([]); setLoading(false); return }
      const data = await res.json()
      if (!mounted) return
      setComments(data)
      setLoading(false)
    }
    load()

    // load current user info from supabase auth
    let ignore = false
  async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser()
        const user = (data && (data.user as any)) ?? null
        if (user && !ignore) {
          const meta = user.user_metadata || {}
          // prefer userdisplayname for Discord, fallbacks to other name fields
          const display = meta.userdisplayname || meta.name || meta.full_name || null
          const usernameHandle = getDiscordUsername(meta)
          const name = display ? `${display}${usernameHandle ? ` (@${usernameHandle})` : ''}` : (usernameHandle || null)
          // avatar: common keys, then Discord-specific construction if possible
          let avatar = meta.avatar_url || meta.picture || meta.image || null
          // Discord OAuth may provide avatar hash in metadata (meta.avatar) and user.id is the discord id
          if (!avatar && meta.avatar && (user.id || (user as any).id)) {
            const uid = user.id || (user as any).id
            avatar = `https://cdn.discordapp.com/avatars/${uid}/${meta.avatar}.png`
          }
          setUserName(name)
          setUserAvatar(avatar || null)

          // sync user metadata to our users table so we have an author_id to reference
          try {
            await fetch('/api/sync-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                id: user.id,
                provider: (user.app_metadata && user.app_metadata.provider) || 'discord',
                username: getDiscordUsername(user.user_metadata || null),
                discriminator: user.user_metadata?.discriminator || null,
                global_name: user.user_metadata?.userdisplayname || user.user_metadata?.global_name || null,
                display_name: user.user_metadata?.userdisplayname || user.user_metadata?.global_name || null,
                avatar: avatar || null,
                metadata: user.user_metadata || null,
              }),
            })
          } catch (e) {
            // ignore sync errors
          }
        }
      } catch (e) {
        // ignore
      }
    }
    loadUser()

    return () => { mounted = false; ignore = true }
  }, [postId])

  async function submit() {
    if (!text.trim()) return
    const payload: any = {
      post_id: postId,
      content: text,
      author_name: userName || 'Anonymous',
      author_avatar: userAvatar || null,
    }

    // if signed in, include author_id so server can associate comment to user
    try {
      const { data } = await supabase.auth.getUser()
      const user = (data && (data.user as any)) ?? null
      if (user) payload.author_id = user.id
    } catch (e) {
      // ignore
    }

    // Optimistic update: show comment immediately
    const tempId = `tmp-${Date.now()}`
    const optimisticComment = {
      id: tempId,
      author_name: payload.author_name,
      author_avatar: payload.author_avatar ?? undefined,
      content: payload.content,
      created_at: new Date().toISOString(),
    }
    setComments((prev) => [...prev, optimisticComment])
    setText('')

    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        throw new Error(`Failed to post comment: ${res.status}`)
      }
      const data = await res.json()
      // server returns normalized single comment object
      const inserted = data
      if (inserted) {
        const normalized = { ...inserted, author_avatar: (inserted as any).author_avatar ?? undefined }
        setComments((prev) => prev.map((c) => (c.id === tempId ? normalized as Comment : c)))
      }
    } catch (err) {
      console.error('Failed to submit comment', err)
      // rollback optimistic update
      setComments((prev) => prev.filter((c) => c.id !== tempId))
      // optionally show an error to user
    }
  }

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-2">댓글</h3>
      {loading ? <div>불러오는 중…</div> : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="border rounded p-3">
              <div className="flex items-center gap-3 mb-2">
                {c.author_avatar ? (
                  <img src={c.author_avatar} alt={c.author_name || 'avatar'} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                )}
                <div className="text-sm font-medium">{c.author_name || 'Anonymous'}</div>
                <div className="text-xs text-muted-foreground ml-auto">{new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div className="text-pretty">{c.content}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 border rounded" rows={4} />
        <div className="flex justify-end mt-2">
          <button onClick={submit} className="bg-primary text-white px-4 py-2 rounded">댓글 작성</button>
        </div>
      </div>
    </div>
  )
}

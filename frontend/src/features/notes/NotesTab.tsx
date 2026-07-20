import { useState } from "react"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useFormatDate } from "@/lib/use-format-date"
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from "./hooks"
import type { Note } from "./types"

function NoteItem({ note, leadId }: { note: Note; leadId: number }) {
  const updateNote = useUpdateNote(leadId)
  const deleteNote = useDeleteNote(leadId)
  const { formatDateTime } = useFormatDate()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)

  const save = () => {
    updateNote.mutate(
      { id: note.id, content },
      { onSuccess: () => setEditing(false), onError: () => toast.error("Could not save the note.") },
    )
  }

  const remove = () => {
    deleteNote.mutate(note.id, { onError: () => toast.error("Could not delete the note.") })
  }

  return (
    <li className="rounded-md border p-3">
      {editing ? (
        <div className="grid gap-2">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={updateNote.isPending}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
            <div className="flex shrink-0 gap-1">
              <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="size-7" onClick={remove}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {note.createdByUserName} · {formatDateTime(note.createdAtUtc)}
            {note.updatedAtUtc && " (edited)"}
          </p>
        </>
      )}
    </li>
  )
}

export function NotesTab({ leadId }: { leadId: number }) {
  const { data, isLoading } = useNotes(leadId)
  const createNote = useCreateNote(leadId)
  const [content, setContent] = useState("")

  const handleAdd = () => {
    if (!content.trim()) return
    createNote.mutate(content, {
      onSuccess: () => {
        setContent("")
        toast.success("Note added")
      },
      onError: () => toast.error("Could not add the note."),
    })
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="grid gap-2 rounded-md border p-4">
        <Textarea placeholder="Add a note..." value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
        <div>
          <Button size="sm" onClick={handleAdd} disabled={createNote.isPending || !content.trim()}>
            Add Note
          </Button>
        </div>
      </div>

      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && data?.items.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}

      <ul className="grid gap-3">
        {data?.items.map((note) => (
          <NoteItem key={note.id} note={note} leadId={leadId} />
        ))}
      </ul>
    </div>
  )
}

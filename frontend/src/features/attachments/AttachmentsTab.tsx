import { useRef, useState } from "react"
import { toast } from "sonner"
import { Download, Paperclip, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAttachments, useDeleteAttachment, useUploadAttachment } from "./hooks"
import { attachmentsApi } from "./attachments-api"
import { ATTACHMENT_CATEGORIES, type Attachment, type AttachmentCategory } from "./types"

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function downloadFile(leadId: number, attachment: Attachment) {
  const response = await attachmentsApi.download(leadId, attachment.id)
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement("a")
  link.href = url
  link.download = attachment.fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function AttachmentsTab({ leadId }: { leadId: number }) {
  const { data, isLoading } = useAttachments(leadId)
  const uploadAttachment = useUploadAttachment(leadId)
  const deleteAttachment = useDeleteAttachment(leadId)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState<AttachmentCategory>("Document")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleUpload = () => {
    if (!selectedFile) return
    uploadAttachment.mutate(
      { file: selectedFile, category },
      {
        onSuccess: () => {
          setSelectedFile(null)
          if (fileInputRef.current) fileInputRef.current.value = ""
          toast.success("Attachment uploaded")
        },
        onError: () => toast.error("Could not upload the file."),
      },
    )
  }

  const handleDownload = async (attachment: Attachment) => {
    try {
      await downloadFile(leadId, attachment)
    } catch {
      toast.error("Could not download the file.")
    }
  }

  const handleDelete = (attachmentId: number) => {
    deleteAttachment.mutate(attachmentId, { onError: () => toast.error("Could not delete the attachment.") })
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="grid gap-2 rounded-md border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <Select value={category} onValueChange={(v) => setCategory(v as AttachmentCategory)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTACHMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleUpload} disabled={!selectedFile || uploadAttachment.isPending}>
            Upload
          </Button>
        </div>
      </div>

      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && data?.length === 0 && <p className="text-sm text-muted-foreground">No attachments yet.</p>}

      <ul className="grid gap-2">
        {data?.map((attachment) => (
          <li key={attachment.id} className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Paperclip className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{attachment.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(attachment.sizeBytes)} · {attachment.uploadedByUserName} ·{" "}
                  {new Date(attachment.uploadedAtUtc).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline">{attachment.category}</Badge>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="size-8" onClick={() => handleDownload(attachment)}>
                <Download className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" className="size-8" onClick={() => handleDelete(attachment.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { importApi } from "./import-api"
import { SUPPORTED_FIELDS, type LeadImportPreview, type LeadImportResult } from "./types"

const SKIP = "__skip__"

function guessMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const header of headers) {
    const normalized = header.toLowerCase().replace(/[^a-z]/g, "")
    const match = SUPPORTED_FIELDS.find((field) => field.toLowerCase() === normalized)
    if (match) mapping[header] = match
  }
  return mapping
}

export function ImportLeadsDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"select" | "preview" | "result">("select")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<LeadImportPreview | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [result, setResult] = useState<LeadImportResult | null>(null)

  // mapping is keyed by CSV header -> target field name, so "is Name mapped" means
  // checking the values, not looking up mapping.Name (which would check for a header literally called "Name").
  const mappedFields = new Set(Object.values(mapping))
  const canImport = mappedFields.has("Name") && mappedFields.has("Phone")

  const previewMutation = useMutation({ mutationFn: (f: File) => importApi.preview(f) })
  const importMutation = useMutation({
    mutationFn: () => importApi.import(file!, mapping),
  })

  const reset = () => {
    setStep("select")
    setFile(null)
    setPreview(null)
    setMapping({})
    setResult(null)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const handlePreview = () => {
    if (!file) return
    previewMutation.mutate(file, {
      onSuccess: (data) => {
        setPreview(data)
        setMapping(guessMapping(data.headers))
        setStep("preview")
      },
      onError: () => toast.error("Could not read that file. Use .xlsx or .csv."),
    })
  }

  const handleImport = () => {
    importMutation.mutate(undefined, {
      onSuccess: (data) => {
        setResult(data)
        setStep("result")
        queryClient.invalidateQueries({ queryKey: ["leads"] })
      },
      onError: () => toast.error("Import failed. Check the file and try again."),
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
          <DialogDescription>Upload an Excel (.xlsx) or CSV file of leads.</DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="grid gap-4">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            <DialogFooter>
              <Button onClick={handlePreview} disabled={!file || previewMutation.isPending}>
                {previewMutation.isPending ? "Reading file..." : "Preview"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Map each column to a lead field. Columns left as "Skip" are ignored.
            </p>
            <div className="max-h-64 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Sample</TableHead>
                    <TableHead>Maps to</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.headers.map((header) => (
                    <TableRow key={header}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {preview.sampleRows[0]?.[header] ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mapping[header] ?? SKIP}
                          onValueChange={(v) =>
                            setMapping((prev) => {
                              const next = { ...prev }
                              if (v === SKIP) delete next[header]
                              else next[header] = v
                              return next
                            })
                          }
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SKIP}>Skip</SelectItem>
                            {SUPPORTED_FIELDS.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground">{preview.sampleRows.length} sample row(s) shown.</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={importMutation.isPending || !canImport}>
                {importMutation.isPending ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
            {!canImport && (
              <p className="text-sm text-destructive">Map at least Name and Phone before importing.</p>
            )}
          </div>
        )}

        {step === "result" && result && (
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{result.created} created</Badge>
              <Badge variant="secondary">{result.skippedDuplicates} duplicates skipped</Badge>
              {result.failed > 0 && <Badge variant="destructive">{result.failed} failed</Badge>}
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-md border p-2 text-sm">
                {result.errors.map((err) => (
                  <p key={err.rowNumber} className="text-destructive">
                    Row {err.rowNumber}: {err.error}
                  </p>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

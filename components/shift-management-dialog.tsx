"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, Loader2 } from "lucide-react"
import { generateShiftCloseTemplate } from "@/lib/excel-templates"
import { toast } from "sonner"

interface ShiftManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branchName?: string
  branchId?: string
}

export function ShiftManagementDialog({ open, onOpenChange, branchName, branchId }: ShiftManagementDialogProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDownloadTemplate = () => {
    generateShiftCloseTemplate(branchName)
    toast.success("Template downloaded successfully")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    if (!branchId) {
      toast.error("No branch selected")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("branchId", branchId)

      const response = await fetch("/api/shifts/close-excel", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      toast.success("Shift closed successfully")
      setSelectedFile(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to close shift")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Shift Management - Close Shift with Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Step 1: Download Template</Label>
            <p className="text-sm text-muted-foreground">
              Download the Excel template with columns for Date, Shift, Nozzle ID, Nozzle Meter Reading, Tank ID, and
              Tank Volume.
            </p>
            <Button onClick={handleDownloadTemplate} variant="outline" className="w-full bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Download Shift Close Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Step 2: Fill Template & Upload</Label>
            <p className="text-sm text-muted-foreground">
              Fill in the meter readings and tank volumes, then upload the completed file to close the shift.
            </p>
            <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="cursor-pointer" />
            {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
          </div>

          <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Closing Shift...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Close Shift
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

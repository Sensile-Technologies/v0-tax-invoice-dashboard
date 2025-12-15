"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, Loader2 } from "lucide-react"
import { generateGlobalShiftCloseTemplate } from "@/lib/excel-templates"
import { toast } from "sonner"

interface GlobalShiftUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalShiftUploadDialog({ open, onOpenChange }: GlobalShiftUploadDialogProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [branches, setBranches] = useState<{ name: string }[]>([])

  useEffect(() => {
    if (open) {
      fetchBranches()
    }
  }, [open])

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches?status=active')
      const result = await response.json()

      if (!result.success) {
        console.error("Error fetching branches:", result.error)
        toast.error("Failed to fetch branches")
      } else {
        setBranches(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
      toast.error("Failed to fetch branches")
    }
  }

  const handleDownloadTemplate = () => {
    if (branches.length === 0) {
      toast.error("No active branches found")
      return
    }

    generateGlobalShiftCloseTemplate(branches)
    toast.success("Global template downloaded successfully")
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

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("branchId", "global") // Indicator for global upload

      const response = await fetch("/api/shifts/close-excel", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      toast.success(`Successfully closed shifts for ${data.results?.length || 0} branches`)
      if (data.errors && data.errors.length > 0) {
        toast.warning(`Some errors occurred: ${data.errors.join(", ")}`)
      }
      setSelectedFile(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to close shifts")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Global Shift Management - Close All Branch Shifts</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Step 1: Download Global Template</Label>
            <p className="text-sm text-muted-foreground">
              Download the Excel template with separate sheets for each branch. Each sheet contains the branch name in
              the first row.
            </p>
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full bg-transparent"
              disabled={branches.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Global Shift Close Template ({branches.length} branches)
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Step 2: Fill Template & Upload</Label>
            <p className="text-sm text-muted-foreground">
              Fill in the meter readings and tank volumes for each branch, then upload to close all shifts at once.
            </p>
            <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="cursor-pointer" />
            {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
          </div>

          <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Closing All Shifts...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Close All Shifts
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

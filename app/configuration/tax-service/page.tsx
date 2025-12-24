"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Download, RefreshCw, Bell, FileText, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CodeListItem {
  cd_cls: string
  cd: string
  cd_nm: string
  cd_desc?: string
  use_yn: string
}

interface ItemClassification {
  item_cls_cd: string
  item_cls_nm: string
  item_cls_lvl: number
  tax_ty_cd?: string
  use_yn: string
}

interface Notice {
  notce_no: number
  title: string
  cont: string
  dtl_url?: string
  last_req_dt?: string
}

export default function TaxServiceConfigurationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const [codeListData, setCodeListData] = useState<CodeListItem[]>([])
  const [itemClassData, setItemClassData] = useState<ItemClassification[]>([])
  const [noticesData, setNoticesData] = useState<Notice[]>([])

  const getBackendUrl = () => {
    const config = localStorage.getItem("backendConfig")
    if (config) {
      try {
        const parsed = JSON.parse(config)
        return parsed.port ? `${parsed.url}:${parsed.port}` : parsed.url
      } catch {
        return "http://20.224.40.56:8088"
      }
    }
    return "http://20.224.40.56:8088"
  }

  const handlePullCodeList = async () => {
    setLoading({ ...loading, codelist: true })
    try {
      const backendUrl = getBackendUrl()
      const response = await fetch("/api/kra/codes", {
        method: "POST",
        headers: {
          "x-backend-url": backendUrl,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to pull code list")
      }

      const result = await response.json()
      const data = result.data || []
      setCodeListData(data)
      toast.success(`Successfully pulled ${data.length} code list items`)
    } catch (error) {
      console.error("Error pulling code list:", error)
      toast.error("Failed to pull code list from tax service")
    } finally {
      setLoading({ ...loading, codelist: false })
    }
  }

  const handlePullItemClassification = async () => {
    setLoading({ ...loading, itemclass: true })
    try {
      const backendUrl = getBackendUrl()
      const response = await fetch("/api/kra/items/classifications", {
        method: "POST",
        headers: {
          "x-backend-url": backendUrl,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to pull item classifications")
      }

      const result = await response.json()
      const data = result.data || []
      setItemClassData(data)
      toast.success(`Successfully pulled ${data.length} item classifications`)
    } catch (error) {
      console.error("Error pulling item classifications:", error)
      toast.error("Failed to pull item classifications from tax service")
    } finally {
      setLoading({ ...loading, itemclass: false })
    }
  }

  const handlePullNotices = async () => {
    setLoading({ ...loading, notices: true })
    try {
      const backendUrl = getBackendUrl()
      const response = await fetch("/api/kra/notices", {
        method: "POST",
        headers: {
          "x-backend-url": backendUrl,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to pull notices")
      }

      const result = await response.json()
      const data = result.data || []
      setNoticesData(data)
      toast.success(`Successfully pulled ${data.length} notices from KRA`)
    } catch (error) {
      console.error("Error pulling notices:", error)
      toast.error("Failed to pull notices from tax service")
    } finally {
      setLoading({ ...loading, notices: false })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Tax Service Configuration</h1>
          <p className="text-slate-600 mt-1">Pull master data and updates from KRA TIMS service</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Code List
            </CardTitle>
            <CardDescription>
              Pull tax codes, payment types, units of measure, and other code lists from KRA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-600">
              Code lists include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Tax type codes (A, B, C, D, E)</li>
                <li>Payment type codes</li>
                <li>Unit of measure codes</li>
                <li>Receipt type codes</li>
                <li>Registration type codes</li>
              </ul>
            </div>
            <Button onClick={handlePullCodeList} disabled={loading.codelist} className="w-full">
              {loading.codelist ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Pulling...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Pull Code List
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Item Classification
            </CardTitle>
            <CardDescription>Pull product/service classification codes and tax categories from KRA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-600">
              Item classifications include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Product categories</li>
                <li>Service categories</li>
                <li>Tax type mappings</li>
                <li>Classification levels</li>
                <li>Major target flags</li>
              </ul>
            </div>
            <Button onClick={handlePullItemClassification} disabled={loading.itemclass} className="w-full">
              {loading.itemclass ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Pulling...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Pull Classifications
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notices
            </CardTitle>
            <CardDescription>Pull important notices, updates, and announcements from KRA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-600">
              Notices include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>System updates</li>
                <li>Compliance reminders</li>
                <li>Policy changes</li>
                <li>Maintenance schedules</li>
                <li>Important announcements</li>
              </ul>
            </div>
            <Button onClick={handlePullNotices} disabled={loading.notices} className="w-full">
              {loading.notices ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Pulling...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Pull Notices
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How to Use Tax Service Configuration</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>1. Configure Backend URL:</strong> First, make sure you've configured the KRA TIMS backend URL in
            Security Settings (profile dropdown → Security Settings → Backend Configuration).
          </p>
          <p>
            <strong>2. Pull Master Data:</strong> Click the buttons above to pull the latest master data from KRA. This
            should be done:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>During initial setup</li>
            <li>When KRA releases updates to code lists or classifications</li>
            <li>Periodically to check for new notices</li>
          </ul>
          <p>
            <strong>3. Review Notices:</strong> After pulling notices, review them for important compliance updates or
            system changes.
          </p>
          <p>
            <strong>4. BHF ID Mapping:</strong> Each branch is mapped to a unique Branch Office ID (BHF ID) for KRA
            compliance. Thika Greens is currently assigned BHF ID "03".
          </p>
        </CardContent>
      </Card>

      {codeListData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Code List Results ({codeListData.length} items)</CardTitle>
            <CardDescription>Tax codes, payment types, units, and other code lists pulled from KRA</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code Class</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Code Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codeListData.map((item, index) => (
                    <TableRow key={`${item.cd_cls}-${item.cd}-${index}`}>
                      <TableCell className="font-medium">{item.cd_cls}</TableCell>
                      <TableCell>{item.cd}</TableCell>
                      <TableCell>{item.cd_nm}</TableCell>
                      <TableCell className="text-slate-600">{item.cd_desc || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${item.use_yn === "Y" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {item.use_yn === "Y" ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {itemClassData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Item Classification Results ({itemClassData.length} items)</CardTitle>
            <CardDescription>Product and service classification codes with tax type mappings</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Classification Code</TableHead>
                    <TableHead>Classification Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Tax Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemClassData.map((item, index) => (
                    <TableRow key={`${item.item_cls_cd}-${index}`}>
                      <TableCell className="font-medium">{item.item_cls_cd}</TableCell>
                      <TableCell>{item.item_cls_nm}</TableCell>
                      <TableCell>{item.item_cls_lvl}</TableCell>
                      <TableCell>{item.tax_ty_cd || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${item.use_yn === "Y" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {item.use_yn === "Y" ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {noticesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>KRA Notices ({noticesData.length} items)</CardTitle>
            <CardDescription>Important notices, updates, and announcements from KRA</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notice No.</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Detail URL</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noticesData.map((item, index) => (
                    <TableRow key={`${item.notce_no}-${index}`}>
                      <TableCell className="font-medium">{item.notce_no}</TableCell>
                      <TableCell className="font-medium max-w-xs">{item.title}</TableCell>
                      <TableCell className="text-slate-600 max-w-md truncate">{item.cont}</TableCell>
                      <TableCell>
                        {item.dtl_url ? (
                          <a
                            href={item.dtl_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.last_req_dt ? new Date(item.last_req_dt).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

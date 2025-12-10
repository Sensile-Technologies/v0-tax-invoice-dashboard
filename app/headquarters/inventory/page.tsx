"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, Search } from "lucide-react"

export default function HardwareInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [hardware, setHardware] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHardware()
  }, [])

  const fetchHardware = async () => {
    try {
      // Fetch hardware with branch information
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/hardware?select=*,branches(name,location)`,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setHardware(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching hardware:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHardware = hardware.filter(
    (item) =>
      item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hardware_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branches?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "retired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <DashboardHeader currentBranch="hq" />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Package className="h-10 w-10 text-white" />
            Hardware Inventory
          </h1>
          <p className="text-white/80 mt-2">Track all hardware assigned to branches</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by serial number, type, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Hardware Table */}
        <Card className="rounded-2xl shadow-lg border-2">
          <CardHeader>
            <CardTitle>All Hardware</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading hardware...</div>
            ) : filteredHardware.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hardware found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Hardware Type</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHardware.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.serial_number}</TableCell>
                      <TableCell>{item.hardware_type}</TableCell>
                      <TableCell>{item.branches?.name || "Unassigned"}</TableCell>
                      <TableCell>{item.branches?.location || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(item.assigned_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t px-8 py-4 text-center text-sm text-muted-foreground">
        Powered by Sensile Technologies East Africa Ltd
      </footer>
    </div>
  )
}

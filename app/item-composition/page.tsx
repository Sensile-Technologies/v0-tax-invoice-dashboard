"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/lib/currency-utils"

interface Item {
  id: string
  item_code: string
  item_name: string
  item_type: string
  purchase_price: number
  sale_price: number
  tax_type: string
  status: string
}

interface CompositeItem {
  id: string
  item_code: string
  item_name: string
  sale_price: number
  tax_type: string
  compositions: Array<{
    parent_item_id: string
    parent_item_name: string
    percentage: number
  }>
}

interface CompositionInput {
  parent_item_id: string
  percentage: number
}

export default function ItemCompositionPage() {
  const [items, setItems] = useState<Item[]>([])
  const [compositeItems, setCompositeItems] = useState<CompositeItem[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [itemCode, setItemCode] = useState("")
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [compositions, setCompositions] = useState<CompositionInput[]>([{ parent_item_id: "", percentage: 0 }])
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [calculatedTaxType, setCalculatedTaxType] = useState<string>("")

  const { toast } = useToast()
  const supabase = createClient()
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    fetchItems()
    fetchCompositeItems()
  }, [])

  useEffect(() => {
    calculateCompositeValues()
  }, [compositions, items])

  const fetchItems = async () => {
    const selectedBranch = localStorage.getItem("selectedBranch")
    if (!selectedBranch) return

    const branch = JSON.parse(selectedBranch)

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("branch_id", branch.id)
      .eq("status", "active")
      .neq("item_type", "composite")
      .order("item_name")

    if (error) {
      console.error("Error fetching items:", error)
      return
    }

    setItems(data || [])
  }

  const fetchCompositeItems = async () => {
    const selectedBranch = localStorage.getItem("selectedBranch")
    if (!selectedBranch) return

    const branch = JSON.parse(selectedBranch)

    const { data: composites, error } = await supabase
      .from("items")
      .select(`
        id,
        item_code,
        item_name,
        sale_price,
        tax_type
      `)
      .eq("branch_id", branch.id)
      .eq("item_type", "composite")
      .order("item_name")

    if (error) {
      console.error("Error fetching composite items:", error)
      return
    }

    // Fetch compositions for each composite item
    const compositesWithCompositions = await Promise.all(
      (composites || []).map(async (composite) => {
        const { data: comps } = await supabase
          .from("item_compositions")
          .select(`
            parent_item_id,
            percentage,
            parent:items!item_compositions_parent_item_id_fkey(item_name)
          `)
          .eq("composite_item_id", composite.id)

        return {
          ...composite,
          compositions: (comps || []).map((c: any) => ({
            parent_item_id: c.parent_item_id,
            parent_item_name: c.parent?.item_name || "",
            percentage: c.percentage,
          })),
        }
      }),
    )

    setCompositeItems(compositesWithCompositions)
  }

  const calculateCompositeValues = () => {
    let totalPrice = 0
    let totalPercentage = 0
    const taxTypes: Record<string, number> = {}

    compositions.forEach((comp) => {
      if (comp.parent_item_id && comp.percentage > 0) {
        const parentItem = items.find((item) => item.id === comp.parent_item_id)
        if (parentItem) {
          const contribution = (comp.percentage / 100) * parentItem.sale_price
          totalPrice += contribution
          totalPercentage += comp.percentage

          // Track tax type contributions
          taxTypes[parentItem.tax_type] = (taxTypes[parentItem.tax_type] || 0) + comp.percentage
        }
      }
    })

    setCalculatedPrice(totalPrice)

    // Determine dominant tax type
    let dominantTaxType = ""
    let maxPercentage = 0
    Object.entries(taxTypes).forEach(([taxType, percentage]) => {
      if (percentage > maxPercentage) {
        maxPercentage = percentage
        dominantTaxType = taxType
      }
    })

    setCalculatedTaxType(dominantTaxType || "A")
  }

  const addComposition = () => {
    setCompositions([...compositions, { parent_item_id: "", percentage: 0 }])
  }

  const removeComposition = (index: number) => {
    setCompositions(compositions.filter((_, i) => i !== index))
  }

  const updateComposition = (index: number, field: keyof CompositionInput, value: string | number) => {
    const updated = [...compositions]
    updated[index] = { ...updated[index], [field]: value }
    setCompositions(updated)
  }

  const handleCreateComposite = async () => {
    const selectedBranch = localStorage.getItem("selectedBranch")
    if (!selectedBranch) {
      toast({
        title: "Error",
        description: "Please select a branch first",
        variant: "destructive",
      })
      return
    }

    // Validation
    if (!itemCode || !itemName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const totalPercentage = compositions.reduce((sum, comp) => sum + Number(comp.percentage), 0)
    if (totalPercentage !== 100) {
      toast({
        title: "Error",
        description: "Total percentage must equal 100%",
        variant: "destructive",
      })
      return
    }

    const validCompositions = compositions.filter((comp) => comp.parent_item_id && comp.percentage > 0)
    if (validCompositions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one parent item",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const branch = JSON.parse(selectedBranch)

      // Create the composite item
      const { data: newItem, error: itemError } = await supabase
        .from("items")
        .insert({
          branch_id: branch.id,
          item_code: itemCode,
          item_name: itemName,
          description: description,
          item_type: "composite",
          purchase_price: calculatedPrice,
          sale_price: calculatedPrice,
          tax_type: calculatedTaxType,
          status: "active",
        })
        .select()
        .single()

      if (itemError) throw itemError

      // Create the compositions
      const compositionsData = validCompositions.map((comp) => ({
        composite_item_id: newItem.id,
        parent_item_id: comp.parent_item_id,
        percentage: comp.percentage,
      }))

      const { error: compsError } = await supabase.from("item_compositions").insert(compositionsData)

      if (compsError) throw compsError

      toast({
        title: "Success",
        description: "Composite item created successfully",
      })

      // Reset form
      setItemCode("")
      setItemName("")
      setDescription("")
      setCompositions([{ parent_item_id: "", percentage: 0 }])
      setIsCreating(false)
      fetchCompositeItems()
    } catch (error: any) {
      console.error("Error creating composite item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create composite item",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComposite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this composite item?")) return

    const { error } = await supabase.from("items").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete composite item",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Composite item deleted successfully",
    })
    fetchCompositeItems()
  }

  const totalPercentage = compositions.reduce((sum, comp) => sum + Number(comp.percentage || 0), 0)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Item Composition</h1>
                <p className="text-muted-foreground">
                  Create composite items from parent items with percentage-based pricing
                </p>
              </div>
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Composite Item
                </Button>
              )}
            </div>

            {isCreating && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Composite Item</CardTitle>
                  <CardDescription>Define a new item composed of multiple parent items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="item_code">
                        Item Code <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="item_code"
                        value={itemCode}
                        onChange={(e) => setItemCode(e.target.value)}
                        placeholder="Enter item code"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="item_name">
                        Item Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="item_name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Enter item name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Parent Items Composition</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addComposition}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {compositions.map((comp, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-1">
                            <Select
                              value={comp.parent_item_id}
                              onValueChange={(value) => updateComposition(index, "parent_item_id", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select parent item" />
                              </SelectTrigger>
                              <SelectContent>
                                {items.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.item_name} ({formatCurrency(item.sale_price)})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={comp.percentage}
                              onChange={(e) =>
                                updateComposition(index, "percentage", Number.parseFloat(e.target.value) || 0)
                              }
                              placeholder="Percentage"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeComposition(index)}
                            disabled={compositions.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Total Percentage:</span>
                        <span className={totalPercentage === 100 ? "text-green-600" : "text-destructive"}>
                          {totalPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-blue-50 dark:bg-blue-950">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Calculator className="mr-2 h-5 w-5" />
                        Calculated Values
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sale Price:</span>
                        <span className="font-semibold">{formatCurrency(calculatedPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tax Type:</span>
                        <span className="font-semibold">{calculatedTaxType || "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button onClick={handleCreateComposite} disabled={loading || totalPercentage !== 100}>
                      {loading ? "Creating..." : "Create Composite Item"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false)
                        setItemCode("")
                        setItemName("")
                        setDescription("")
                        setCompositions([{ parent_item_id: "", percentage: 0 }])
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Composite Items</CardTitle>
                <CardDescription>View and manage existing composite items</CardDescription>
              </CardHeader>
              <CardContent>
                {compositeItems.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No composite items found. Create one to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Composition</TableHead>
                        <TableHead>Sale Price</TableHead>
                        <TableHead>Tax Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compositeItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.item_code}</TableCell>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {item.compositions.map((comp, idx) => (
                                <div key={idx} className="text-sm text-muted-foreground">
                                  {comp.parent_item_name} ({comp.percentage}%)
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.sale_price)}</TableCell>
                          <TableCell>{item.tax_type}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteComposite(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

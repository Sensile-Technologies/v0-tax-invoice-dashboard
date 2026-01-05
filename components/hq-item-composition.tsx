"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "react-toastify"

interface Item {
  id: string
  item_code: string
  item_name: string
  item_type: string
  tax_type: string
  status: string
}

interface CompositeItem {
  id: string
  item_code: string
  item_name: string
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

export function HqItemComposition() {
  const [items, setItems] = useState<Item[]>([])
  const [compositeItems, setCompositeItems] = useState<CompositeItem[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  const [itemCode, setItemCode] = useState("")
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [compositions, setCompositions] = useState<CompositionInput[]>([{ parent_item_id: "", percentage: 0 }])
  const [calculatedTaxType, setCalculatedTaxType] = useState<string>("")

  useEffect(() => {
    fetchItems()
    fetchCompositeItems()
  }, [])

  useEffect(() => {
    calculateCompositeValues()
  }, [compositions, items])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/headquarters/items")
      const result = await response.json()

      if (!result.success) {
        console.error("Error fetching items:", result.error)
        return
      }

      const nonComposites = (result.items || []).filter((item: Item) => item.item_type !== "composite")
      setItems(nonComposites)
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  const fetchCompositeItems = async () => {
    try {
      const response = await fetch("/api/headquarters/items")
      const result = await response.json()

      if (!result.success) {
        console.error("Error fetching composite items:", result.error)
        return
      }

      const composites = (result.items || []).filter((item: Item) => item.item_type === "composite")

      const compositesWithCompositions = await Promise.all(
        composites.map(async (composite: any) => {
          const compsRes = await fetch(`/api/item-compositions?composite_item_id=${composite.id}`)
          const compsResult = await compsRes.json()
          const comps = compsResult.success ? compsResult.data : []

          return {
            ...composite,
            compositions: comps.map((c: any) => ({
              parent_item_id: c.parent_item_id,
              parent_item_name: c.parent_item_name || "",
              percentage: c.percentage,
            })),
          }
        }),
      )

      setCompositeItems(compositesWithCompositions)
    } catch (error) {
      console.error("Error fetching composite items:", error)
    }
  }

  const calculateCompositeValues = () => {
    const taxTypes: Record<string, number> = {}

    compositions.forEach((comp) => {
      if (comp.parent_item_id && comp.percentage > 0) {
        const parentItem = items.find((item) => item.id === comp.parent_item_id)
        if (parentItem) {
          taxTypes[parentItem.tax_type] = (taxTypes[parentItem.tax_type] || 0) + comp.percentage
        }
      }
    })

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
    if (!itemCode || !itemName) {
      toast.error("Please fill in all required fields")
      return
    }

    const totalPercentage = compositions.reduce((sum, comp) => sum + Number(comp.percentage), 0)
    if (totalPercentage !== 100) {
      toast.error("Total percentage must equal 100%")
      return
    }

    const validCompositions = compositions.filter((comp) => comp.parent_item_id && comp.percentage > 0)
    if (validCompositions.length === 0) {
      toast.error("Please add at least one parent item")
      return
    }

    setLoading(true)

    try {
      const itemRes = await fetch('/api/headquarters/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName,
          itemCode: itemCode,
          description: description,
          itemType: "composite",
          taxType: calculatedTaxType,
          origin: "1",
          classCode: "10101500",
          quantityUnit: "U",
          packageUnit: "NT",
        })
      })

      const itemResult = await itemRes.json()
      if (!itemResult.success) throw new Error(itemResult.error)

      const newItem = itemResult.item

      for (const comp of validCompositions) {
        await fetch('/api/item-compositions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            composite_item_id: newItem.id,
            parent_item_id: comp.parent_item_id,
            percentage: comp.percentage,
          })
        })
      }

      toast.success("Composite item created successfully")

      setItemCode("")
      setItemName("")
      setDescription("")
      setCompositions([{ parent_item_id: "", percentage: 0 }])
      setIsCreating(false)
      fetchItems()
      fetchCompositeItems()
    } catch (error: any) {
      console.error("Error creating composite item:", error)
      toast.error(error.message || "Failed to create composite item")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComposite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this composite item?")) return

    try {
      const response = await fetch(`/api/headquarters/items?id=${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!result.success) {
        toast.error("Failed to delete composite item")
        return
      }

      toast.success("Composite item deleted successfully")
      fetchCompositeItems()
    } catch (error) {
      console.error("Error deleting composite:", error)
      toast.error("Failed to delete composite item")
    }
  }

  const totalPercentage = compositions.reduce((sum, comp) => sum + Number(comp.percentage || 0), 0)

  const itemOptions = items.map((item) => ({
    value: item.id,
    label: item.item_name
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Create composite items from parent items with percentage-based pricing
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Create Composite Item
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="rounded-2xl shadow-lg border-2">
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
                      <SearchableSelect
                        value={comp.parent_item_id}
                        onValueChange={(value) => updateComposition(index, "parent_item_id", value)}
                        placeholder="Select parent item"
                        searchPlaceholder="Search items..."
                        options={itemOptions}
                      />
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
                        placeholder="%"
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
                  Calculated Tax Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tax Type (based on composition):</span>
                  <span className="font-semibold">{calculatedTaxType || "N/A"}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Set pricing for composite items per branch in Inventory Management.
                </p>
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

      <Card className="rounded-2xl shadow-lg border-2">
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
  )
}

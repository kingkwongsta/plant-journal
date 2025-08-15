"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tag, Save, Undo2 } from "lucide-react"
import { nanoid } from "nanoid"

type QuickTag = {
  id: string
  emoji: string
  text: string
}

type QuickTagForUpdate = {
    id: string;
    emoji?: string;
    text?: string;
}

// Editor component for managing quick details
function QuickDetailsEditor({
  items,
  onAdd,
  onUpdate,
  onDelete,
}: {
  items: QuickTag[]
  onAdd: () => void
  onUpdate: (id: string, data: { emoji?: string; text?: string }) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 p-2 border rounded-md bg-background">
            <input
              className="w-12 h-8 text-center bg-muted rounded-md outline-none focus:ring-2 focus:ring-ring"
              value={it.emoji}
              onChange={(e) => onUpdate(it.id, { emoji: e.target.value })}
            />
            <input
              className="flex-grow h-8 px-2 bg-muted rounded-md outline-none focus:ring-2 focus:ring-ring"
              value={it.text}
              onChange={(e) => onUpdate(it.id, { text: e.target.value })}
            />
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(it.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={onAdd}>
        Add New Detail
      </Button>
    </div>
  )
}

export default function AdminPage() {
  // State for the current list being edited
  const [quickDetails, setQuickDetails] = useState<QuickTag[]>([])
  // State to store the original list from the server to compare for changes
  const [originalQuickDetails, setOriginalQuickDetails] = useState<QuickTag[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("quick-details")

  // Fetch initial data
  useEffect(() => {
    const fetchQuickDetails = async () => {
      try {
        const response = await fetch("http://localhost:8000/quick-details")
        if (response.ok) {
          const data = await response.json()
          // Add a client-side-only ID for new items that don't have a DB id yet
          const detailsWithIds = data.map((d: any) => ({ ...d, id: d.id || nanoid() }))
          setQuickDetails(detailsWithIds)
          setOriginalQuickDetails(JSON.parse(JSON.stringify(detailsWithIds))) // Deep copy
        }
      } catch (error) {
        console.error("Failed to fetch quick details:", error)
      }
    }
    fetchQuickDetails()
  }, [])
  
  const hasChanges = JSON.stringify(quickDetails) !== JSON.stringify(originalQuickDetails)

  const handleDiscardChanges = () => {
    setQuickDetails(JSON.parse(JSON.stringify(originalQuickDetails))) // Deep copy to restore
  }

  const handleAddQuick = () => {
    // Add a new item with a temporary client-side ID
    setQuickDetails([...quickDetails, { id: nanoid(), emoji: "🌱", text: "New Detail" }])
  }

  const handleUpdateQuick = (id: string, data: { emoji?: string; text?: string }) => {
    setQuickDetails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    )
  }

  const handleDeleteQuick = (id: string) => {
    setQuickDetails((prev) => prev.filter((item) => item.id !== id))
  }
  
  const handleSaveChanges = async () => {
    setIsSaving(true)

    // Find what's new, updated, and deleted by comparing the current and original states
    const originalMap = new Map(originalQuickDetails.map(item => [item.id, item]));
    const currentMap = new Map(quickDetails.map(item => [item.id, item]));

    const toCreate = quickDetails.filter(item => !originalMap.has(item.id));
    const toDelete = originalQuickDetails.filter(item => !currentMap.has(item.id));
    const toUpdate: QuickTagForUpdate[] = quickDetails
        .filter(item => {
            if (!originalMap.has(item.id)) return false;
            const originalItem = originalMap.get(item.id);
            return JSON.stringify(item) !== JSON.stringify(originalItem);
        })
        .map(({id, emoji, text}) => ({id, emoji, text})); // Ensure we have the ID

    const batchPayload = {
      create: toCreate.map(({ emoji, text }) => ({ emoji, text })),
      update: toUpdate,
      delete: toDelete.map(item => item.id),
    };

    try {
      // Execute the single batch API call
      await fetch("http://localhost:8000/quick-details/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchPayload),
      });

      // Refetch the data from the server to get the latest state with correct DB IDs
      const response = await fetch("http://localhost:8000/quick-details");
      const data = await response.json();
      setQuickDetails(data);
      setOriginalQuickDetails(JSON.parse(JSON.stringify(data)));

    } catch (error) {
      console.error("Failed to save changes:", error);
      // You might want to add error handling for the user here
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-1 mb-6">
        <TabsTrigger value="quick-details" className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Quick Details
        </TabsTrigger>
      </TabsList>
      <TabsContent value="quick-details">
        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
              <CardTitle>Manage Quick Details</CardTitle>
              {hasChanges && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDiscardChanges} disabled={isSaving}>
                    <Undo2 className="w-4 h-4 mr-2" />
                    Discard Changes
                  </Button>
                  <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <QuickDetailsEditor
              items={quickDetails}
              onAdd={handleAddQuick}
              onUpdate={handleUpdateQuick}
              onDelete={handleDeleteQuick}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

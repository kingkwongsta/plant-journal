"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Leaf,
  Calendar,
  TrendingUp,
  Sparkles,
  BarChart3,
  MapPin,
  Sun,
  Droplets,
  Thermometer,
  ArrowRight,
  Loader2,
} from "lucide-react"

// Mock data for demonstration
type QuickTag = {
  id?: string
  key?: string
  label?: string
  emoji: string
  snippet?: string
  text?: string
}

// Fallback defaults used only if the backend is unavailable or returns an empty list
const defaultQuickTags: QuickTag[] = [
  { key: "harvest", label: "Harvest", emoji: "🍅", snippet: "Harvested today.", text: "Harvest" },
  { key: "bloom", label: "Bloom", emoji: "🌸", snippet: "Noticed new blooms.", text: "Bloom" },
  { key: "watering", label: "Watering", emoji: "💧", snippet: "Watered thoroughly.", text: "Watering" },
  { key: "new-growth", label: "New Growth", emoji: "🌱", snippet: "New growth appeared.", text: "New Growth" },
  { key: "pest", label: "Pest Issue", emoji: "🐛", snippet: "Observed pest activity.", text: "Pest Issue" },
  { key: "sunny", label: "Sunny Day", emoji: "☀️", snippet: "Very sunny today.", text: "Sunny Day" },
]

type JournalEntry = {
  id: string
  plant_name: string
  plant_variety: string
  date: string
  notes: string
  image_urls?: string[]
  weather?: string
  humidity?: number
  event_type: string
}

const mockEntries = [
  {
    id: "1",
    type: "harvest",
    plant: "Cherry Tomatoes",
    quantity: "2 lbs",
    notes: "First big harvest of the season! Beautiful red color and perfect ripeness.",
    date: "2025-08-14",
    weather: { temp: "78°F", condition: "Sunny" },
    photos: ["/cherry-tomatoes-harvest.png"],
  },
  {
    id: "2",
    type: "bloom",
    plant: "Sunflowers",
    notes: "Three massive sunflower heads opened today. They're facing east perfectly.",
    date: "2025-08-13",
    weather: { temp: "82°F", condition: "Partly Cloudy" },
    photos: ["/sunflower-blooms-garden.png"],
  },
  {
    id: "3",
    type: "snapshot",
    plant: "Herb Garden",
    notes: "Weekly check-in on the herb spiral. Basil is getting huge!",
    date: "2025-08-12",
    weather: { temp: "75°F", condition: "Overcast" },
    photos: ["/herb-spiral-basil.png"],
  },
]

const plantStats = [
  { name: "Tomatoes", harvests: 12, status: "Peak Season" },
  { name: "Herbs", harvests: 8, status: "Growing" },
  { name: "Flowers", harvests: 0, status: "Blooming" },
  { name: "Peppers", harvests: 3, status: "Early Season" },
]

export default function EdenLogAI() {
  const [activeTab, setActiveTab] = useState("journal")
  const [newEntry, setNewEntry] = useState<{ photos: string[]; notes: string }>({ photos: [], notes: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [quickDetails, setQuickDetails] = useState<QuickTag[]>([])
  const [isSavingQuick, setIsSavingQuick] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/journal/from-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newEntry.notes }),
      })
      if (response.ok) {
        const result = await response.json()
        setJournalEntries([result.data, ...journalEntries])
        setNewEntry({ photos: [], notes: "" }) // Clear the input
      } else {
        console.error("Failed to create journal entry")
      }
    } catch (error) {
      console.error("Error creating journal entry:", error)
    }
    setIsLoading(false)
  }

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    const urls = Array.from(files).map((file) => URL.createObjectURL(file))
    setNewEntry((prev) => ({ ...prev, photos: [...prev.photos, ...urls] }))
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "harvest":
        return "🌾"
      case "bloom":
        return "🌸"
      case "snapshot":
        return "📸"
      default:
        return "🌱"
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "harvest":
        return "bg-accent text-accent-foreground"
      case "bloom":
        return "bg-chart-5 text-primary-foreground"
      case "snapshot":
        return "bg-chart-4 text-primary-foreground"
      default:
        return "bg-primary text-primary-foreground"
    }
  }

  const insertQuickSnippet = (snippet: string, emoji?: string, label?: string) => {
    const prefix = newEntry.notes.trim().length > 0 ? "\n" : ""
    const text = emoji && label ? `${emoji} ${label}: ${snippet}` : snippet
    setNewEntry((prev) => ({ ...prev, notes: prev.notes + `${prefix}${text}` }))
  }

  // API interaction for Quick Details
  useEffect(() => {
    const fetchQuickDetails = async () => {
      try {
        const response = await fetch("http://localhost:8000/quick-details")
        if (response.ok) {
          const data = await response.json()
          if (data.length === 0) {
            setQuickDetails(defaultQuickTags)
          } else {
            const normalized = data.map((it: any) => ({
              id: it.id,
              emoji: it.emoji,
              text: it.text,
              label: it.text,
              snippet: it.text, // Assuming snippet is the same as text
            }))
            setQuickDetails(normalized)
          }
        } else {
          setQuickDetails(defaultQuickTags)
        }
      } catch (error) {
        console.error("Failed to fetch quick details:", error)
        setQuickDetails(defaultQuickTags)
      }
    }
    fetchQuickDetails()
  }, [])

  const handleAddQuick = async () => {
    setIsSavingQuick(true)
    try {
      await fetch("http://localhost:8000/quick-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji: "🌱", text: "New Detail" }),
      })
      // Refetch after adding
      const response = await fetch("http://localhost:8000/quick-details")
      const data = await response.json()
      const normalized = data.map((it: any) => ({
        id: it.id,
        emoji: it.emoji,
        text: it.text,
        label: it.text,
        snippet: it.text,
      }))
      setQuickDetails(normalized)
    } finally {
      setIsSavingQuick(false)
    }
  }

  const handleUpdateQuick = async (id: string, data: { emoji?: string; text?: string }) => {
    await fetch(`http://localhost:8000/quick-details/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    // Optimistic update
    setQuickDetails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    )
  }

  const handleDeleteQuick = async (id: string) => {
    await fetch(`http://localhost:8000/quick-details/${id}`, {
      method: "DELETE",
    })
    // Optimistic update
    setQuickDetails((prev) => prev.filter((item) => item.id !== id))
  }

  // Inline editor component for managing quick details
  function QuickDetailsEditor({
    items,
    onAdd,
    onUpdate,
    onDelete,
    isSaving,
  }: {
    items: QuickTag[]
    onAdd: () => void
    onUpdate: (id: string, data: { emoji?: string; text?: string }) => Promise<void>
    onDelete: (id: string) => Promise<void>
    isSaving: boolean
  }) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <div key={it.id ?? it.text} className="flex items-center gap-1 border rounded-md px-2 py-1 bg-background">
              <input
                className="w-10 text-center bg-transparent outline-none"
                value={it.emoji}
                onChange={(e) => it.id && onUpdate(it.id, { emoji: e.target.value })}
              />
              <input
                className="w-32 bg-transparent outline-none"
                value={it.text ?? ""}
                onChange={(e) => it.id && onUpdate(it.id, { text: e.target.value })}
              />
              {it.id && (
                <Button size="sm" variant="ghost" onClick={() => onDelete(it.id!)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={onAdd} disabled={isSaving}>
          Add Quick Detail
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-semibold tracking-tight">Plant Journal</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {activeTab === "journal" && null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Garden Feed
            </TabsTrigger>
            <TabsTrigger value="plants" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              My Plants
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-6">
            {/* Main logging interface */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Create New Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-card">
                  <div className="px-4 pt-4">
                    <label className="text-sm font-medium text-muted-foreground">
                      What happened in your garden today?
                    </label>
                  </div>
                  <div className="px-4 py-3">
                    <Textarea
                      placeholder="Write naturally... e.g., 'Harvested 5 huge beefsteak tomatoes today - they're perfectly ripe and smell amazing!' or 'My sunflowers finally bloomed! The biggest one is facing east and about 6 feet tall.'"
                      className="min-h-40 md:min-h-48 resize-none rounded-md border bg-background"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 pb-4">
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFilesSelected(e.target.files)}
                      />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Photos
                      </Button>
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {newEntry.photos.map((src, index) => (
                          <div key={index} className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                            <img src={src} alt={`photo-${index}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" className="px-4" onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                      Submit
                    </Button>
                  </div>
                </div>
                {/* Quick details subsection (moved inside the Create New Entry card) */}
                <div className="rounded-lg border bg-card">
                  <div className="px-4 pt-4">
                    <label className="text-sm font-medium text-muted-foreground">Quick Details</label>
                  </div>
                  <div className="px-4 pb-4 pt-3 space-y-3">
                    <div className="flex flex-wrap gap-3">
                      {quickDetails.map((tag) => (
                        <Button
                          key={tag.id ?? tag.key ?? tag.text}
                          variant="outline"
                          size="sm"
                          className="rounded-md bg-transparent"
                          onClick={() => insertQuickSnippet(tag.snippet ?? tag.text ?? "", tag.emoji, tag.text)}
                        >
                          <span className="mr-2">{tag.emoji}</span>
                          {tag.text}
                        </Button>
                      ))}
                    </div>
                    <QuickDetailsEditor
                      items={quickDetails}
                      onAdd={handleAddQuick}
                      onUpdate={handleUpdateQuick}
                      onDelete={handleDeleteQuick}
                      isSaving={isSavingQuick}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            

            {/* Recent entries preview */}
            <Card className="border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Entries</CardTitle>
                  <Button variant="outline" onClick={() => setActiveTab("feed")}>
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {journalEntries.slice(0, 2).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={entry.image_urls?.[0] || "/placeholder.svg"} alt={entry.plant_name} />
                        <AvatarFallback>{getEventIcon(entry.event_type)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{entry.plant_name}</span>
                          <Badge variant="secondary" className={getEventColor(entry.event_type)}>
                            {entry.event_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{entry.notes}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Garden Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <div className="grid gap-6">
              {journalEntries.map((entry) => (
                <Card key={entry.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={entry.image_urls?.[0] || "/placeholder.svg"} alt={entry.plant_name} />
                          <AvatarFallback>{getEventIcon(entry.event_type)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-semibold">{entry.plant_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={getEventColor(entry.event_type)}>
                              {entry.event_type}
                            </Badge>
                            {/* {entry.quantity && <Badge variant="outline">{entry.quantity}</Badge>} */}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Sun className="w-3 h-3" />
                          {entry.weather}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground leading-relaxed">{entry.notes}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {entry.image_urls?.map((photo, index) => (
                        <div key={index} className="aspect-square rounded-md overflow-hidden bg-muted">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`${entry.plant_name} ${entry.event_type}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {/* {entry.weather.temp} */}
                      </div>
                      <div className="flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        {/* {entry.weather.condition} */}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Garden Bed A
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Plants Tab */}
          <TabsContent value="plants" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plantStats.map((plant, index) => (
                <Card key={plant.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plant.name}</CardTitle>
                      <Badge variant="outline">{plant.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-square rounded-md overflow-hidden bg-muted">
                      <img
                        src={`/abstract-geometric-shapes.png?height=200&width=200&query=${plant.name.toLowerCase()} garden plants`}
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Harvests</span>
                        <span className="font-semibold">{plant.harvests}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Entry</span>
                        <span className="font-semibold">2 days ago</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Timeline
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-chart-1" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-chart-1">23</div>
                  <p className="text-sm text-muted-foreground">Total harvests this month</p>
                  <div className="text-sm text-chart-2">+15% from last month</div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-chart-4" />
                    Weather Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-chart-4">82%</div>
                  <p className="text-sm text-muted-foreground">Optimal growing days</p>
                  <div className="text-sm text-chart-2">Perfect conditions</div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-chart-3" />
                    Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold text-chart-3">Tomatoes</div>
                  <p className="text-sm text-muted-foreground">Most productive plant</p>
                  <div className="text-sm text-chart-2">12 harvests</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border">
              <CardHeader>
                <CardTitle>Garden Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Interactive chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

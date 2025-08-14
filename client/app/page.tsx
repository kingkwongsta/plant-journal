"use client"

import { useState } from "react"
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
  Upload,
  Sparkles,
  BarChart3,
  MapPin,
  Sun,
  Droplets,
  Thermometer,
  ArrowRight,
} from "lucide-react"

// Mock data for demonstration
const mockEntries = [
  {
    id: 1,
    type: "harvest",
    plant: "Cherry Tomatoes",
    quantity: "2 lbs",
    notes: "First big harvest of the season! Beautiful red color and perfect ripeness.",
    date: "2025-08-14",
    weather: { temp: "78°F", condition: "Sunny" },
    photos: ["/cherry-tomatoes-harvest.png"],
  },
  {
    id: 2,
    type: "bloom",
    plant: "Sunflowers",
    notes: "Three massive sunflower heads opened today. They're facing east perfectly.",
    date: "2025-08-13",
    weather: { temp: "82°F", condition: "Partly Cloudy" },
    photos: ["/sunflower-blooms-garden.png"],
  },
  {
    id: 3,
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
  const [activeTab, setActiveTab] = useState("journal") // Default to journal tab
  const [newEntry, setNewEntry] = useState({ photos: [], notes: "" })

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-sans text-foreground">Plant Journal</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("feed")}>
                <Calendar className="w-4 h-4 mr-2" />
                View Feed
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("insights")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Insights
              </Button>
            </div>
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
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Create New Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo upload area */}
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-primary/5">
                  <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Upload Garden Photos</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Drag and drop your photos here, or click to browse. Multiple photos welcome!
                  </p>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Camera className="w-5 h-5 mr-2" />
                    Choose Photos
                  </Button>
                </div>

                {/* Text input area */}
                <div className="space-y-4">
                  <label className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    What happened in your garden today?
                  </label>
                  <Textarea
                    placeholder="Write naturally... e.g., 'Harvested 5 huge beefsteak tomatoes today - they're perfectly ripe and smell amazing!' or 'My sunflowers finally bloomed! The biggest one is facing east and about 6 feet tall.'"
                    className="min-h-32 text-base resize-none border-2 focus:border-primary"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  />
                </div>

                <Button className="w-full" size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create AI-Powered Entry
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            

            {/* Recent entries preview */}
            <Card>
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
                  {mockEntries.slice(0, 2).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={entry.photos[0] || "/placeholder.svg"} alt={entry.plant} />
                        <AvatarFallback>{getEventIcon(entry.type)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{entry.plant}</span>
                          <Badge variant="secondary" className={getEventColor(entry.type)}>
                            {entry.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{entry.notes}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{entry.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Garden Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <div className="grid gap-6">
              {mockEntries.map((entry) => (
                <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={entry.photos[0] || "/placeholder.svg"} alt={entry.plant} />
                          <AvatarFallback>{getEventIcon(entry.type)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-semibold">{entry.plant}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={getEventColor(entry.type)}>
                              {entry.type}
                            </Badge>
                            {entry.quantity && <Badge variant="outline">{entry.quantity}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          {entry.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Sun className="w-3 h-3" />
                          {entry.weather.temp}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground leading-relaxed">{entry.notes}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {entry.photos.map((photo, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`${entry.plant} ${entry.type}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {entry.weather.temp}
                      </div>
                      <div className="flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        {entry.weather.condition}
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
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plant.name}</CardTitle>
                      <Badge variant="outline">{plant.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
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
                    <Button variant="outline" className="w-full bg-transparent">
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
              <Card>
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

              <Card>
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

              <Card>
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

            <Card>
              <CardHeader>
                <CardTitle>Garden Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
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

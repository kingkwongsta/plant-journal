# 🌱 EdenLog AI: The Intelligent Garden Journal

Log your garden's story, effortlessly. EdenLog AI transforms your simple photos and notes into a rich, structured database of your plant journey. Stop filling out forms and start journaling naturally. Our AI understands your language, identifies your plants, and tracks their lifecycle from seed to harvest.

Built with Next.js 15, FastAPI, and Supabase, and powered by a cutting-edge Large Language Model (LLM).

## ✨ Key Innovation: The AI Smart Log

The core of EdenLog AI is its ability to understand unstructured, conversational input. You no longer need to navigate menus or fill out forms.

**User Experience Flow:**

1.  **Capture the Moment:** Snap one or more photos of a plant (a harvest, a bloom, or just a daily check-in).
2.  **Add a Simple Note:** Write a short, freeform description like `"Harvested 5 big beefsteak tomatoes today, they look great!"` or `"First rose bloom of the season 🌹"` or simply `"Zucchini plant check-in"`.
3.  **Submit:** The app sends your images and text to the backend.
4.  **AI Magic:** Our LLM analyzes your input. It extracts the key entities:
      * **Event Type:** Harvest, Bloom, Snapshot, Watering, etc.
      * **Plant Name:** "Beefsteak Tomato", "Rose", "Zucchini"
      * **Quantity:** 5
      * **Qualitative Notes:** "they look great"
      * **Associated Media:** Links the uploaded photos to this event.
5.  **Structured Data:** The AI generates a structured JSON object, which is then saved to your database, creating a perfect, queryable log entry automatically.

**Example In Action:**

> **User Input:**
>
>   * *Uploads 3 photos of cherry tomatoes in a basket.*
>   * *Text:* `"First cherry tomato harvest of the year! Got a small basketful."`
>
> **LLM Output (sent to database):**
>
> ```json
> {
>   "event_type": "harvest",
>   "plant_variety_name": "Cherry Tomato",
>   "quantity": null, // or an estimated amount like "small basket"
>   "notes": "First harvest of the year!",
>   "photos": ["url_to_photo1.jpg", "url_to_photo2.jpg", "url_to_photo3.jpg"],
>   "event_date": "2025-08-14T21:19:43Z"
> }
> ```

## 🌟 Updated Features

### 🍎 Core Functionality

  - **AI-Powered Journaling**: Submit freeform text and photos; the LLM automatically structures and categorizes your entry as a harvest, bloom, or snapshot.
  - **Unified Garden Feed**: View all your logs—harvests, blooms, and snapshots—in a single, scrollable timeline, just like a social media feed for your garden.
  - **Automated Plant Journey**: The app automatically compiles all events for a specific plant into a complete lifecycle timeline, from planting to final harvest.
  - **Smart Search & Insights**: Ask natural language questions like `"How many tomatoes did I harvest last month?"` or `"Show me all my rose blooms"`.
  - **Weather Integration**: Automatically correlates each entry with historical weather data from Open-Meteo for deeper insights.
  - **Intelligent Photo Gallery**: Photos are automatically tagged by the LLM with plant name, event type, and date. View your garden's progress through four modes: Timeline, Garden View, Photo Wall, and Data Insights.
  - **Data Export**: Export your beautifully structured data for personal records or advanced analysis.

### 🔧 Technical Highlights

  - **AI/LLM Integration**: Core logic built around an LLM API (e.g., Gemini, OpenAI GPT-4o) for natural language understanding and structured data generation.
  - **Prompt Engineering**: Sophisticated, context-aware prompt templates to ensure reliable JSON output from freeform user text.
  - **Modern Stack**: Next.js 15 (App Router), React 19, FastAPI (Python), TypeScript.
  - **Real-time Database**: Supabase PostgreSQL with Row Level Security to store the structured log data.
  - **Backend Orchestration**: FastAPI manages the flow: receives user input, calls the LLM API, processes the response, and commits the structured data to Supabase.
  - **Image Processing Pipeline**: On-upload, images are compressed, optimized, and stored (e.g., Supabase Storage), with their URLs linked in the database entry.
  - **Unified Event Architecture**: A single, powerful database table stores all event types (harvest, bloom, snapshot), differentiated by an `event_type` column for simple and efficient querying.
  - **Robust API**: Versioned, paginated RESTful API with comprehensive Pydantic validation for all incoming and outgoing data.
  - **Background Jobs**: Future-ready for tasks like generating weekly summary reports or AI-driven pest identification from photos.
  - **Enterprise-Grade Foundation**: Retains JWT-based auth, structured logging, health checks, comprehensive testing (unit, integration, E2E), and Dockerized deployment.
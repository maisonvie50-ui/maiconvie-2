import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Booking Sync Endpoint from Google Sheets
  app.post("/api/booking-sync", async (req, res) => {
    try {
      const payload = req.body;
      console.log("Received booking sync:", payload);

      if (!payload.customerName) {
        return res.status(400).json({ error: "Missing customerName" });
      }

      // Convert time from "18:30" string to proper format if needed, but the DB likely accepts texts
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          customer_name: payload.customerName,
          phone: payload.phone || null,
          email: payload.email || null,
          pax: payload.pax || 2,
          booking_date: payload.bookingDate || new Date().toISOString().split("T")[0],
          time: payload.time || "18:00",
          status: payload.status || "new",
          source: payload.source || "email",
          customer_type: payload.customerType || "retail",
          notes: payload.notes || [],
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase Error inserting booking:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ success: true, booking: data });
    } catch (err: any) {
      console.error("Error in booking-sync endpoint:", err);
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));

    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

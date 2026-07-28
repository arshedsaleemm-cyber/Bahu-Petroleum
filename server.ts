import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Bahu AI Assistant Endpoint
  app.post("/api/bahu-ai", async (req, res) => {
    try {
      const { prompt, history, dataContext, currentUserRole } = req.body;

      // Security check
      if (currentUserRole !== "ADMIN") {
        return res.status(403).json({
          error: "Security Restriction: Only Admin can access Bahu AI Assistant.",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Gemini API key is not configured in server environment.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `
You are "Bahu AI Assistant", the official intelligent business manager, accountant, and financial analyst for Bahu Petroleum Management System, founded by Founder & CEO Mian Rashid Saleem.

YOUR ROLES & CAPABILITIES:
1. Business Accountant & Financial Analyst
2. Petrol Pump Operations Manager
3. Tank Stock & Inventory Analyst
4. Employee / HR Management Assistant
5. Profitability & Cost Efficiency Expert

DATA ACCESS & REAL SYSTEM SNAPSHOT:
You are provided with real-time, live operational data from all 16 business modules:
- Fuel Sales (Daily Petrol Cash entries, nozzle readings, sales revenue)
- Tank Stock Management (Underground tanks, capacity, current stock, fuel added/consumed)
- Fuel Deliveries & Tanker Shortages (Shipments received, shortages in liters & Rs.)
- Lubricants (Stock levels, sales, top-selling categories)
- Employee / Worker Management (Worker profiles, pending salaries, advances given, total payments)
- Attendance Management (Absent counts, monthly attendance summaries, poor attendance alerts)
- Salary & Advances (Total paid, pending salary, advance balance per worker)
- Credit Card Sales (Card sales amounts, terminal logs)
- Infinity Card Sales (Infini card collections, pending balances)
- Daily Cash Management (Cash sales today, total cash collection, cash available in register)
- Bank Management (Bank accounts, deposits, withdrawals, total bank balance vs cash balance)
- Expense Management (Categorized expenses: Water, Electricity, Maintenance, Repair, Salary, Cleaning, Security, Internet, Fuel, Supplies, Taxes, Other)
- Tax Management (Tax paid, tax logs)
- Attached Business Sales (Car Wash, Tyre Shop, Tuck Shop, Fast Food/Restaurant, Rental Income)
- Overall Profit & Business Analysis (Total Income - Total Expenses = Net Profit)
- Smart Reports (Daily, Weekly, Monthly, Yearly summaries)

RESPONSE FORMATTING & RULES:
- Calculate exact totals and extract real numbers directly from the provided Live Database Snapshot.
- Always provide clear, well-structured, professional Markdown answers.
- Use bullet points, bold key figures, and tables where applicable.
- For financial summaries, include:
  1. Direct Answer & Summary
  2. Detailed Categorized Breakdown (Amounts in PKR/Rs., Fuel in Liters)
  3. Total Summary Amount
  4. Comparisons with previous periods / other departments when relevant
  5. Actionable Business Insights (e.g., alert if expense is unusually high, tank fuel is low, fuel shortage occurred, worker salary is pending, or department performance is low).
- Maintain a respectful, highly sharp, and executive tone suited for the CEO / Admin of Bahu Petroleum.
- Read-Only Security Rule: You analyze data and answer questions. You cannot modify or delete database records.
`;

      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-10)
            .map((h: any) => `${h.role === "user" ? "Admin" : "Bahu AI"}: ${h.text}`)
            .join("\n")
        : "";

      const fullPrompt = `
=== LIVE DATABASE SNAPSHOT ===
${JSON.stringify(dataContext || {}, null, 2)}

=== CONVERSATION HISTORY ===
${formattedHistory}

=== ADMIN QUESTION ===
${prompt}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return res.json({ text: response.text });
    } catch (error: any) {
      console.error("Bahu AI Assistant Error:", error);
      return res.status(500).json({
        error: error?.message || "Failed to generate AI response.",
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Bahu Petroleum Enterprise" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bahu Petroleum Server running on http://localhost:${PORT}`);
  });
}

startServer();

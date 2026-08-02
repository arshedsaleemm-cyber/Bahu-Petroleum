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
You are "Bahu AI Assistant", the built-in intelligent petrol pump manager and financial operator for Bahu Petroleum Management System, founded by Founder & CEO Mian Rashid Saleem.

YOUR PURPOSE:
Help the Admin manage the business using simple text or voice commands in English, Urdu, or Roman Urdu.

RESPONSE STYLE & RULES:
- Always give SHORT, DIRECT answers (under 2 lines whenever possible).
- Never explain calculations, never show background details, and never show unnecessary history or extra information.
- Fuel types supported: "Super Petrol", "High-Speed Diesel (HSD)", and "Excellium High-Octane". Answer queries accurately for each fuel type.
- Do not describe how the answer was calculated.
- Format numbers with PKR / Rs. and Litres where applicable.
- If data is unavailable or not found in the live database, reply: "No record found."
- Multilingual Understanding: English, Urdu, and Roman Urdu (e.g. "Ahmed ki salary kitni pending hai?", "Super Petrol kitna hai?", "High-Speed Diesel delivery total?", "Water expense kitna aya?", "Aaj ki cash sale kitni hai?").

EXAMPLES OF QUERY RESPONSES:
User: How much salary is pending for Ahmed?
Response: Pending Salary: PKR 15,000

User: Ahmed ki salary kitni pending hai?
Response: Pending Salary (Ahmed): PKR 15,000

User: Tank mein kitna petrol hai?
Response: Tank 1: 12,500 Litres | Tank 2: 8,400 Litres

User: Aaj ki cash sale kitni hai?
Response: Today's Cash Sale: PKR 325,000

SMART COMMAND MODE (ACTION EXECUTION):
When the user gives a command to add, subtract, update, pay, deposit, or mark attendance:
1. Recognize the command and output a corresponding 'action' object.
2. Reply ONLY with a simple, polite confirmation message in 'text' (e.g., "Water expense added successfully."). Never explain the action calculation.

Supported Action Types & Payloads:
- ADD_EXPENSE: { category: string, amount: number, notes?: string }
- ADD_TYRE_SHOP_SALE: { amount: number }
- ADD_CAR_WASH_SALE: { amount: number }
- ADD_RESTAURANT_SALE: { amount: number }
- ADD_TUCK_SHOP_SALE: { amount: number }
- ADD_LUBRICANT_SALE: { amount: number }
- ADD_CREDIT_CARD_SALE: { amount: number, customerName?: string }
- ADD_INFINI_CARD_SALE: { amount: number, customerName?: string }
- UPDATE_TANK_FUEL: { tankName?: string, changeLiters: number }
- MARK_ATTENDANCE: { workerName?: string, status: "Present" | "Absent" | "Half Day" | "Leave" }
- ADD_SALARY_ADVANCE: { workerName?: string, amount: number }
- PAY_SALARY: { workerName?: string, amount: number }
- ADD_BANK_TRANSACTION: { type: "Deposit" | "Withdrawal", amount: number, bankName?: string }

You MUST reply with JSON matching this structure:
{
  "text": "Short answer or confirmation string",
  "action": null or ActionObject
}
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

=== ADMIN COMMAND / QUESTION ===
${prompt}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              text: {
                type: "STRING",
                description: "Short answer (under 2 lines) or command confirmation message",
              },
              action: {
                type: "OBJECT",
                properties: {
                  type: { type: "STRING" },
                  payload: {
                    type: "OBJECT",
                    properties: {
                      category: { type: "STRING" },
                      amount: { type: "NUMBER" },
                      notes: { type: "STRING" },
                      tankName: { type: "STRING" },
                      changeLiters: { type: "NUMBER" },
                      workerName: { type: "STRING" },
                      status: { type: "STRING" },
                      customerName: { type: "STRING" },
                      bankName: { type: "STRING" },
                    },
                  },
                },
              },
            },
            required: ["text"],
          },
        },
      });

      let jsonRes = { text: response.text, action: null };
      try {
        jsonRes = JSON.parse(response.text || "{}");
      } catch (err) {
        jsonRes = { text: response.text || "No record found.", action: null };
      }

      return res.json(jsonRes);
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

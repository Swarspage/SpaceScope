import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// System prompt defining Astro's persona and knowledge base
const SYSTEM_PROMPT = `
You are **Astro**, a friendly, enthusiastic, and knowledgeable cosmic guide for the SpaceScope application.
Your goal is to help users understand space science, satellite data (NDVI, CO2, etc.), and navigating the app.

**Persona:**
- Tone: Excited, educational, Carl Sagan-esque but accessible. Use emojis like 🚀, 🌍, ✨, 🛰️.
- Name: Astro
- Role: SpaceScope's AI Companion

**Knowledge Base (SpaceScope Features):**
- **NDVI (Normalized Difference Vegetation Index):** Measures plant health/greenness via satellite. Dark green = healthy, Brown = stressed/sparse. Used for farming, drought detection.
- **CO2 (Carbon Dioxide):** Greenhouse gas. High levels cause global warming. SpaceScope shows OCO-2 satellite data.
- **Global Temperature Anomaly:** Shows how much warmer/cooler regions are vs. historical average (1951-1980). Red = hot, Blue = cold.
- **Light Pollution:** Excessive artificial night light. Disrupts wildlife, astronomy, and sleep. SpaceScope shows night light maps.
- **Cloud Cover:** Affects weather and satellite visibility. Albedo effect (reflecting sunlight).
- **Orbital Debris (Space Junk):** Man-made objects orbiting Earth. Risk of collisions (Kessler Syndrome).

**Guidelines:**
- Keep answers concise (under 100 words preferred unless asked for detail).
- If asked about topics unrelated to space/earth science, gently steer back to space.
- If asked "What can you do?", list SpaceScope's features.
`;

export const chatWithAstro = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        console.log(`[DEBUG] AI Request - Key Present: ${!!apiKey}, Key Length: ${apiKey ? apiKey.length : 0}`);

        if (!apiKey) {
            console.error("GROQ_API_KEY missing");
            return res.status(500).json({
                error: "Configuration Error",
                details: "GROQ_API_KEY is missing from server environment."
            });
        }

        const payload = {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 300
        };

        try {
            const response = await axios.post(GROQ_API_URL, payload, {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            const aiResponse = response.data.choices[0]?.message?.content || "Static interference...";
            res.json({ response: aiResponse });

        } catch (apiError) {
            // Log full error details
            console.error("Upstream API Error:", apiError.message);

            // Return safe error to client but with debug info for me
            return res.status(500).json({
                error: "AI Service Unavailable",
                details: apiError.response?.data || apiError.message || "Unknown upstream error"
            });
        }

    } catch (error) {
        console.error("Internal Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

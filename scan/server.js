const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json({ limit: '10mb' })); 
app.use(cors()); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/analyze-scalp', async (req, res) => {
    try {
        const { image } = req.body; 

        const promptJsonStructure = `
        You are a fast salon trichologist. Analyze the image. Categorize into ONE condition: "Healthy", "Dry", "Oily", "Inflamed", or "Thinning".
        Respond ONLY with a valid JSON object following this strict format. Do not use markdown wraps or code blocks:
        {
          "condition": "The Category chosen",
          "observation": "1 short sentence of what you visually see in the follicle/scalp structure",
          "salon_treatment": "Map to: Scalp Detoxifying Scrub (if Oily), Deep Hydrating Mask (if Dry), Calming Aloe Treatment (if Inflamed), Laser Growth Stimulation (if Thinning), or Balancing Gloss (if Healthy)",
          "home_care": "Map to: Clarifying Shampoo (if Oily), Hyaluronic Serum (if Dry), pH Tonic (if Inflamed), Minoxidil/Peptide drops (if Thinning), or Daily Maintenance Set (if Healthy)"
        }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                promptJsonStructure,
                { inlineData: { mimeType: "image/jpeg", data: image } }
            ],
            config: { responseMimeType: "application/json" }
        });

        res.json(JSON.parse(response.text.trim()));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Analysis engine timed out." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure Server running on port ${PORT}`));
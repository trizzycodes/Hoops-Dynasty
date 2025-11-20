import { GoogleGenAI, Type } from "@google/genai";
import { PlayerCard, Rarity } from "../types";
import { RARITY_MULTIPLIERS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAiScoutedPlayer = async (cost: number): Promise<PlayerCard> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a unique, fictional basketball prospect. 
      Do NOT use real NBA player names. Create a cool sounding fictional name.
      Invent a fictional backstory about where they were discovered (e.g. 'Streetball legend from Rucker Park', 'Euroleague prodigy').
      The player should have high potential.
      Output in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            team: { type: Type.STRING },
            position: { type: Type.STRING },
            lore: { type: Type.STRING },
            rating: { type: Type.NUMBER, description: "Overall rating between 80 and 99" },
            offense: { type: Type.NUMBER, description: "Offense stat 0-99" },
            defense: { type: Type.NUMBER, description: "Defense stat 0-99" }
          },
          required: ["name", "team", "position", "lore", "rating", "offense", "defense"]
        }
      }
    });

    if (!response.text) {
        throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text);
    
    let rarity = Rarity.RARE;
    if (data.rating > 88) rarity = Rarity.EPIC;
    if (data.rating > 94) rarity = Rarity.LEGENDARY;
    if (data.rating > 98) rarity = Rarity.GOAT;

    const price = Math.floor(data.rating * RARITY_MULTIPLIERS[rarity] * 1.5); 

    return {
      id: `ai_${Date.now()}`,
      name: data.name,
      team: data.team,
      position: data.position,
      rarity,
      set: 'Base', // AI cards are technically base set for now, but have special flag
      rating: data.rating,
      price,
      imageSeed: Math.floor(Math.random() * 5000) + 2000,
      isAiGenerated: true,
      isLocked: true, // AI cards come locked
      description: data.lore,
      stats: {
        offense: data.offense,
        defense: data.defense,
        potential: 99
      }
    };

  } catch (error) {
    console.error("Scouting failed, using fallback", error);
    const fallbackRating = 85;
    return {
      id: `ai_fallback_${Date.now()}`,
      name: "Mystery Rookie",
      team: "Unknowns",
      position: "PF",
      rarity: Rarity.RARE,
      set: 'Base',
      rating: fallbackRating,
      price: 1000,
      imageSeed: 9999,
      isAiGenerated: true,
      isLocked: true,
      description: "The scouting report was lost, but this player shows promise.",
      stats: { offense: 80, defense: 80, potential: 90 }
    };
  }
};
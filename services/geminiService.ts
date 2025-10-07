
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Fix: Use process.env.API_KEY directly in the constructor.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash";

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        mealName: { type: Type.STRING, description: 'The name of the meal suggestion.' },
        description: { type: Type.STRING, description: 'A brief, appealing description of the meal.' },
        calories: { type: Type.NUMBER, description: 'Estimated calories per serving.' },
        protein: { type: Type.NUMBER, description: 'Estimated grams of protein per serving.' },
      },
      required: ["mealName", "description", "calories", "protein"],
    },
};

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
      mealName: { type: Type.STRING, description: 'The name of the generated recipe.' },
      description: { type: Type.STRING, description: 'A short description of the recipe.' },
      ingredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING, description: 'e.g., "1 cup of rice" or "200g chicken breast"' }
      },
      instructions: {
        type: Type.ARRAY,
        items: { type: Type.STRING, description: 'A single step in the recipe instructions.' }
      }
    },
    required: ["mealName", "description", "ingredients", "instructions"],
};

export const getMealSuggestions = async (goal: 'bulking' | 'cutting'): Promise<GenerateContentResponse> => {
  const prompt = `Provide 5 meal suggestions for someone who is ${goal}. The suggestions should be high in protein. Keep descriptions brief.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: suggestionSchema,
      temperature: 0.8,
    },
  });
  return response;
};

export const generateMealFromIngredients = async (ingredients: string): Promise<GenerateContentResponse> => {
  const prompt = `Create a simple and healthy recipe using the following ingredients: ${ingredients}. If the ingredients are insufficient, you can add 1-2 common pantry staples (like olive oil, salt, pepper).`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
      temperature: 0.7,
    },
  });
  return response;
};

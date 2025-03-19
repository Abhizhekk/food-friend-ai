
import { toast } from "sonner";

// Interfaces
export interface RecipeData {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  nutritionalInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    [key: string]: string;
  };
  cookingTime: string;
  servings: string;
  tips: string[];
  allergens?: string[];
}

// Constants
const API_KEY = "AIzaSyC2gggme5_81IpWLikt-aXfyfkvA1A0RNk"; // This should ideally be in env variables
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

class GeminiService {
  private apiKey: string;
  
  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Identifies a recipe from an image
   */
  async identifyRecipeFromImage(imageBase64: string): Promise<RecipeData | null> {
    try {
      // First identify what food is in the image
      const foodIdentification = await this.callGeminiVision(
        "Identify exactly what food/dish is shown in this image. Only return the name of the dish, nothing else.",
        imageBase64
      );
      
      if (!foodIdentification) {
        toast.error("Unable to identify food in the image");
        return null;
      }

      // Then get full recipe details based on the identified food
      return await this.getRecipeDetails(foodIdentification);
    } catch (error) {
      console.error("Error identifying recipe:", error);
      toast.error("Failed to identify recipe from image");
      return null;
    }
  }

  /**
   * Gets detailed recipe information
   */
  async getRecipeDetails(foodName: string): Promise<RecipeData> {
    try {
      const prompt = `
        Create a detailed recipe for "${foodName}". 
        Return data in a valid JSON format with the following structure:
        {
          "name": "Recipe name",
          "description": "Short description",
          "ingredients": ["ingredient 1", "ingredient 2", ...],
          "steps": ["step 1", "step 2", ...],
          "nutritionalInfo": {
            "calories": "amount",
            "protein": "amount",
            "carbs": "amount",
            "fat": "amount",
            "fiber": "amount"
          },
          "cookingTime": "total time",
          "servings": "number of servings",
          "tips": ["tip 1", "tip 2", ...],
          "allergens": ["allergen 1", "allergen 2", ...] 
        }
        
        Make sure each value is specific and detailed. For ingredients, include quantities.
        For steps, be thorough and specific. Include common allergens in the allergens array.
      `;
      
      const response = await this.callGeminiText(prompt);
      if (!response) {
        throw new Error("No response from Gemini");
      }
      
      // Parse the JSON response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/{[\s\S]*?}/);
                       
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from response");
      }
      
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const recipeData = JSON.parse(jsonStr) as RecipeData;
      
      return recipeData;
    } catch (error) {
      console.error("Error getting recipe details:", error);
      toast.error("Failed to get recipe details");
      
      // Return placeholder data if actual data can't be fetched
      return this.getPlaceholderRecipe(foodName);
    }
  }

  /**
   * Generates a shopping list from ingredients
   */
  async generateShoppingList(ingredients: string[]): Promise<string[]> {
    try {
      const prompt = `
        Convert these recipe ingredients into a smart, organized shopping list. 
        Group similar items together, and return only the shopping list items:
        ${ingredients.join("\n")}
        
        Return as a JSON array of strings, with each string being a shopping list item.
      `;
      
      const response = await this.callGeminiText(prompt);
      if (!response) {
        throw new Error("No response from Gemini");
      }
      
      // Extract JSON array from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/\[([\s\S]*?)\]/) ||
                       response.match(/{[\s\S]*?}/);
                       
      if (!jsonMatch) {
        throw new Error("Could not extract shopping list from response");
      }
      
      let shoppingListStr = jsonMatch[1] || jsonMatch[0];
      // If we got an object with a "list" property, extract that
      if (shoppingListStr.includes('"list"')) {
        const obj = JSON.parse(shoppingListStr);
        return obj.list;
      }
      
      // If we got a raw array, parse it
      if (shoppingListStr.startsWith('[') && shoppingListStr.endsWith(']')) {
        return JSON.parse(shoppingListStr);
      }
      
      // Last resort - parse the ingredients directly
      return ingredients.map(ing => ing.split(" ").slice(1).join(" "));
    } catch (error) {
      console.error("Error generating shopping list:", error);
      toast.error("Failed to generate shopping list");
      return ingredients;
    }
  }

  /**
   * Check ingredients for allergens
   */
  async checkForAllergens(ingredients: string[], userAllergens: string[]): Promise<string[]> {
    if (!userAllergens || userAllergens.length === 0) {
      return [];
    }
    
    try {
      const prompt = `
        Check if any of these ingredients contain or may contain these allergens: ${userAllergens.join(", ")}.
        Ingredients:
        ${ingredients.join("\n")}
        
        Return only the ingredients that contain allergens along with which allergen they contain,
        formatted as a JSON array of strings.
      `;
      
      const response = await this.callGeminiText(prompt);
      if (!response) {
        return [];
      }
      
      // Parse response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/\[([\s\S]*?)\]/) ||
                       response.match(/{[\s\S]*?}/);
                       
      if (!jsonMatch) {
        return [];
      }
      
      let allergensStr = jsonMatch[1] || jsonMatch[0];
      
      // Handle different response formats
      if (allergensStr.includes('"allergens"')) {
        const obj = JSON.parse(allergensStr);
        return obj.allergens;
      }
      
      if (allergensStr.startsWith('[') && allergensStr.endsWith(']')) {
        return JSON.parse(allergensStr);
      }
      
      return [];
    } catch (error) {
      console.error("Error checking allergens:", error);
      return [];
    }
  }

  /**
   * Get answer from chatbot
   */
  async getChatbotResponse(question: string, context: string): Promise<string> {
    try {
      const prompt = `
        You are a helpful cooking assistant. Answer the following cooking question with accurate and helpful information.
        The user's current recipe context is: ${context}
        
        User question: ${question}
        
        Provide a detailed but concise answer focused on the cooking question.
      `;
      
      const response = await this.callGeminiText(prompt);
      return response || "I'm sorry, I couldn't find an answer to that question.";
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      return "I'm having trouble answering that right now. Please try again.";
    }
  }
  
  /**
   * Get voice instructions for cooking mode
   */
  async getVoiceInstructions(steps: string[]): Promise<string[]> {
    try {
      const prompt = `
        Convert these cooking steps into clear, conversational voice instructions 
        that would be easy to follow in a hands-free cooking mode:
        ${steps.join("\n")}
        
        Return as a JSON array of strings, with each string being a voice instruction.
        Keep them concise but thorough, and make them suitable for text-to-speech.
      `;
      
      const response = await this.callGeminiText(prompt);
      if (!response) {
        return steps;
      }
      
      // Extract JSON array from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/\[([\s\S]*?)\]/) ||
                       response.match(/{[\s\S]*?}/);
                       
      if (!jsonMatch) {
        return steps;
      }
      
      let instructionsStr = jsonMatch[1] || jsonMatch[0];
      
      // Parse different response formats
      if (instructionsStr.includes('"instructions"')) {
        const obj = JSON.parse(instructionsStr);
        return obj.instructions;
      }
      
      if (instructionsStr.startsWith('[') && instructionsStr.endsWith(']')) {
        return JSON.parse(instructionsStr);
      }
      
      return steps;
    } catch (error) {
      console.error("Error generating voice instructions:", error);
      return steps;
    }
  }

  /**
   * Call Gemini Pro Vision API with image
   */
  private async callGeminiVision(prompt: string, imageBase64: string): Promise<string> {
    try {
      const url = `${BASE_URL}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
      
      // Format the request payload
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.4,
          topP: 0.9,
          topK: 32,
          maxOutputTokens: 1024,
        }
      };
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Gemini API error:", errorBody);
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No candidates in response");
      }
      
      const content = data.candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error("No content in response");
      }
      
      return content.parts[0].text;
    } catch (error) {
      console.error("Error calling Gemini Vision API:", error);
      throw error;
    }
  }

  /**
   * Call Gemini Pro for text generation
   */
  private async callGeminiText(prompt: string): Promise<string> {
    try {
      const url = `${BASE_URL}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
      
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generation_config: {
          temperature: 0.4,
          topP: 0.9,
          topK: 32,
          maxOutputTokens: 2048,
        }
      };
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Gemini API error:", errorBody);
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No candidates in response");
      }
      
      const content = data.candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error("No content in response");
      }
      
      return content.parts[0].text;
    } catch (error) {
      console.error("Error calling Gemini Text API:", error);
      throw error;
    }
  }

  /**
   * Generate an image with Gemini
   */
  async generateImage(prompt: string): Promise<string | null> {
    try {
      const url = `${BASE_URL}/models/gemini-2.0-flash-experimental:generateContent?key=${this.apiKey}`;
      
      const payload = {
        contents: [
          {
            parts: [
              { text: `Generate a beautiful, professional photo of: ${prompt}. Make it look like a high-quality food photography image.` }
            ]
          }
        ],
        generation_config: {
          temperature: 0.7,
          topP: 0.9,
          topK: 32,
          maxOutputTokens: 2048,
        }
      };
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No candidates in response");
      }
      
      const content = data.candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error("No content in response");
      }
      
      // Extract image data from response
      for (const part of content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  }
  
  // Fallback placeholder recipe if API fails
  private getPlaceholderRecipe(foodName: string): RecipeData {
    return {
      name: foodName || "Delicious Recipe",
      description: "A wonderful dish full of flavor and nutrition.",
      ingredients: [
        "200g main ingredient",
        "1 tbsp oil",
        "2 cloves garlic, minced",
        "Salt and pepper to taste"
      ],
      steps: [
        "Prepare all ingredients by washing and chopping them as needed.",
        "Heat oil in a pan over medium heat.",
        "Add ingredients and cook until done.",
        "Serve hot and enjoy!"
      ],
      nutritionalInfo: {
        calories: "~300 kcal",
        protein: "15g",
        carbs: "30g",
        fat: "12g",
        fiber: "5g"
      },
      cookingTime: "30 minutes",
      servings: "4",
      tips: [
        "For best results, use fresh ingredients.",
        "This recipe can be stored in the refrigerator for up to 3 days."
      ],
      allergens: []
    };
  }
}

// Create and export a singleton instance
export const geminiService = new GeminiService();
export default geminiService;


import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetails from '@/components/RecipeDetails';
import { RecipeData, geminiService } from '@/services/GeminiService';
import { toast } from "sonner";

const Index = () => {
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(false);

  const handleImageCaptured = async (imageBase64: string) => {
    setIsLoading(true);
    setRecipe(null);
    
    try {
      const identifiedRecipe = await geminiService.identifyRecipeFromImage(imageBase64);
      if (identifiedRecipe) {
        setRecipe(identifiedRecipe);
        toast.success(`Identified recipe: ${identifiedRecipe.name}`);
      } else {
        toast.error("Could not identify a recipe from this image. Try another one!");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("An error occurred while processing the image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecipe = () => {
    setViewingDetails(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToRecipe = () => {
    setViewingDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {viewingDetails && recipe ? (
          <div className="max-w-3xl mx-auto pt-4">
            <RecipeDetails 
              recipe={recipe} 
              onBack={handleBackToRecipe} 
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-12">
            <section className="text-center space-y-4 py-12">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4 animate-float">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
                Identify Your Food,<br />Get the Recipe
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Upload a photo of any food, and our AI will identify it and provide you with a complete recipe, nutritional information, and cooking instructions.
              </p>
            </section>
            
            <section>
              <ImageUpload onImageCaptured={handleImageCaptured} />
            </section>
            
            {isLoading && (
              <section className="text-center py-12">
                <div className="inline-flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                  <p className="text-muted-foreground">Finding recipe for your food...</p>
                </div>
              </section>
            )}
            
            {recipe && !isLoading && (
              <section className="space-y-6 animate-fade-in">
                <h2 className="font-display text-2xl font-medium text-center mb-8">Recipe Found!</h2>
                <RecipeCard recipe={recipe} onClick={handleViewRecipe} />
              </section>
            )}
          </div>
        )}
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              <span className="font-display">RecipeAI</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              &copy; {new Date().getFullYear()} RecipeAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

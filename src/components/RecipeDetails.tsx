
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RecipeData } from '@/services/GeminiService';
import NutritionInfo from './NutritionInfo';
import ShoppingList from './ShoppingList';
import CookingMode from './CookingMode';
import ChatSupport from './ChatSupport';
import { AlertTriangle, ArrowLeft, Clock, Users, Bookmark, Share2 } from 'lucide-react';
import { toast } from "sonner";

interface RecipeDetailsProps {
  recipe: RecipeData;
  onBack: () => void;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, onBack }) => {
  const [activeTab, setActiveTab] = useState('instructions');
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [userAllergens, setUserAllergens] = useState<string[]>([]);
  const [allergensChecked, setAllergensChecked] = useState(false);
  
  const checkAllergens = () => {
    // In a real app, this would come from user settings
    const mockUserAllergens = ['peanuts', 'gluten', 'shellfish'];
    setUserAllergens(mockUserAllergens);
    
    const hasAllergens = recipe.allergens && recipe.allergens.some(allergen => 
      mockUserAllergens.some(userAllergen => 
        allergen.toLowerCase().includes(userAllergen.toLowerCase())
      )
    );
    
    if (hasAllergens) {
      toast.warning(
        "This recipe contains ingredients you may be allergic to.",
        {
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
          duration: 5000,
        }
      );
    } else {
      toast.success("No allergens found in this recipe that match your preferences.", { duration: 3000 });
    }
    
    setAllergensChecked(true);
  };

  if (isCookingMode) {
    return (
      <CookingMode 
        recipe={recipe} 
        onExit={() => setIsCookingMode(false)} 
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 -ml-3">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold mb-3">{recipe.name}</h1>
        <p className="text-muted-foreground mb-4">{recipe.description}</p>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{recipe.cookingTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{recipe.servings} servings</span>
          </div>
          
          {recipe.allergens && recipe.allergens.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 flex items-center gap-1"
                onClick={checkAllergens}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span>Check Allergens</span>
              </Button>
            </div>
          )}
        </div>
        
        {allergensChecked && userAllergens.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Allergen Information</p>
                <p className="text-sm text-muted-foreground">
                  This recipe may contain ingredients you're allergic to. Please check the ingredients list carefully.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userAllergens.map(allergen => (
                    <Badge key={allergen} variant="outline" className="bg-destructive/20 border-destructive/40">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="shopping">Shopping List</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="instructions" className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-medium mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-baseline gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="font-display text-xl font-medium mb-4">Cooking Steps</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
                    {index + 1}
                  </span>
                  <p className="pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="font-display text-xl font-medium mb-4">Tips</h2>
            <ul className="space-y-2">
              {recipe.tips.map((tip, index) => (
                <li key={index} className="flex items-baseline gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setIsCookingMode(true)}
            >
              Start Cooking Mode
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition">
          <NutritionInfo nutritionalInfo={recipe.nutritionalInfo} />
        </TabsContent>
        
        <TabsContent value="shopping">
          <ShoppingList ingredients={recipe.ingredients} />
        </TabsContent>
        
        <TabsContent value="chat">
          <ChatSupport recipe={recipe} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecipeDetails;

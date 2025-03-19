
import React from 'react';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecipeData } from '@/services/GeminiService';

interface RecipeCardProps {
  recipe: RecipeData;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <Card 
      className="glass-card overflow-hidden cursor-pointer transform hover:translate-y-[-5px] transition-all duration-300"
      onClick={onClick}
    >
      <CardContent className="relative pt-5 pb-7">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs font-medium">
            Recipe
          </Badge>
          {recipe.nutritionalInfo?.calories && (
            <Badge variant="outline" className="text-xs font-medium">
              {recipe.nutritionalInfo.calories}
            </Badge>
          )}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <Badge variant="destructive" className="text-xs font-medium">
              Contains Allergens
            </Badge>
          )}
        </div>
        
        <h3 className="font-display text-lg font-medium mb-2 line-clamp-1">{recipe.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{recipe.cookingTime}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4">
          <ChevronRight className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;

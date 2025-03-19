
import React, { useState, useEffect } from 'react';
import { Check, Clipboard, ShoppingBag, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import geminiService from '@/services/GeminiService';

interface ShoppingListProps {
  ingredients: string[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ ingredients }) => {
  const [shoppingItems, setShoppingItems] = useState<{ item: string; checked: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateShoppingList = async () => {
      try {
        setIsLoading(true);
        const smartList = await geminiService.generateShoppingList(ingredients);
        setShoppingItems(smartList.map(item => ({ item, checked: false })));
      } catch (error) {
        console.error("Error generating shopping list:", error);
        // Fallback to ingredients if smart list fails
        setShoppingItems(ingredients.map(item => ({ item, checked: false })));
      } finally {
        setIsLoading(false);
      }
    };

    generateShoppingList();
  }, [ingredients]);

  const toggleItem = (index: number) => {
    setShoppingItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const clearCheckedItems = () => {
    setShoppingItems(prev => prev.filter(item => !item.checked));
    toast.success("Removed checked items");
  };

  const clearAllItems = () => {
    setShoppingItems([]);
    toast.success("Shopping list cleared");
  };

  const copyToClipboard = () => {
    const text = shoppingItems.map(item => `${item.checked ? '✓' : '☐'} ${item.item}`).join('\n');
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Shopping list copied to clipboard"))
      .catch(err => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-secondary/30 backdrop-blur-sm">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span>Shopping List</span>
            </CardTitle>
            <CardDescription>
              {shoppingItems.length} items needed for this recipe
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyToClipboard}
              disabled={shoppingItems.length === 0}
              title="Copy to clipboard"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={clearAllItems}
              disabled={shoppingItems.length === 0}
              title="Clear list"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                <p className="text-sm text-foreground/80">Generating smart shopping list...</p>
              </div>
            </div>
          ) : shoppingItems.length > 0 ? (
            <div className="space-y-4">
              <ul className="space-y-2">
                {shoppingItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 group">
                    <Checkbox 
                      checked={item.checked} 
                      onCheckedChange={() => toggleItem(index)}
                      className="transition-all data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <span className={`transition-all ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                      {item.item}
                    </span>
                  </li>
                ))}
              </ul>
              
              {shoppingItems.some(item => item.checked) && (
                <div className="pt-4">
                  <Separator className="mb-4" />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center gap-2"
                    onClick={clearCheckedItems}
                  >
                    <Check className="h-4 w-4" />
                    <span>Remove checked items</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No items in shopping list</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Tip: Check off items you already have at home. You can copy this list to your preferred notes or shopping app.
        </p>
      </div>
    </div>
  );
};

export default ShoppingList;

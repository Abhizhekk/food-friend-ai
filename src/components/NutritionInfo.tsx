
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface NutritionInfoProps {
  nutritionalInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    [key: string]: string;
  };
}

const NutritionInfo: React.FC<NutritionInfoProps> = ({ nutritionalInfo }) => {
  // Parse numerical values from nutrition strings (stripping non-numeric characters)
  const parseNutritionValue = (value: string): number => {
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Prepare data for chart
  const chartData = [
    {
      name: 'Protein',
      value: parseNutritionValue(nutritionalInfo.protein),
      color: '#22c55e'  // green
    },
    {
      name: 'Carbs',
      value: parseNutritionValue(nutritionalInfo.carbs),
      color: '#3b82f6'  // blue
    },
    {
      name: 'Fat',
      value: parseNutritionValue(nutritionalInfo.fat),
      color: '#f59e0b'  // amber
    },
    {
      name: 'Fiber',
      value: parseNutritionValue(nutritionalInfo.fiber),
      color: '#8b5cf6'  // purple
    }
  ];

  // Calculate percentage of daily value based on rough estimates
  const dailyValues = {
    calories: 2000,
    protein: 50,
    carbs: 275,
    fat: 78,
    fiber: 28
  };

  const getPercentage = (nutrient: string, value: number): number => {
    const nutrientKey = nutrient.toLowerCase() as keyof typeof dailyValues;
    return Math.min(Math.round((value / dailyValues[nutrientKey]) * 100), 100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Nutrition Facts</CardTitle>
          <CardDescription>Per serving</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-lg">Calories</span>
                <span className="text-lg">{nutritionalInfo.calories}</span>
              </div>
              <Progress 
                value={getPercentage('calories', parseNutritionValue(nutritionalInfo.calories))} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground text-right">
                {getPercentage('calories', parseNutritionValue(nutritionalInfo.calories))}% of daily value
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['protein', 'carbs', 'fat', 'fiber'].map((nutrient) => {
                const value = parseNutritionValue(nutritionalInfo[nutrient]);
                return (
                  <div key={nutrient} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="capitalize">{nutrient}</span>
                      <span>{nutritionalInfo[nutrient]}</span>
                    </div>
                    <Progress 
                      value={getPercentage(nutrient, value)} 
                      className={`h-1.5 ${
                        nutrient === 'protein' ? 'bg-primary/20' :
                        nutrient === 'carbs' ? 'bg-blue-100' :
                        nutrient === 'fat' ? 'bg-amber-100' :
                        'bg-purple-100'
                      }`}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {getPercentage(nutrient, value)}% of daily value
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}g`, 'Amount']}
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
        </p>
      </div>
    </div>
  );
};

export default NutritionInfo;

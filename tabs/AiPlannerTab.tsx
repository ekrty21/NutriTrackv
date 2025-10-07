import React, { useState } from 'react';
import { getMealSuggestions, generateMealFromIngredients } from '../services/geminiService';
import { type Meal } from '../types';

interface AiPlannerTabProps {
  addMeal: (mealData: Omit<Meal, 'id'>) => void;
}

type Suggestion = {
  mealName: string;
  description: string;
  calories: number;
  protein: number;
};

type Recipe = {
  mealName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
};

export const AiPlannerTab: React.FC<AiPlannerTabProps> = ({ addMeal }) => {
  const [activeFeature, setActiveFeature] = useState<'suggestions' | 'recipe'>('suggestions');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goal, setGoal] = useState<'bulking' | 'cutting'>('bulking');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [ingredients, setIngredients] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const response = await getMealSuggestions(goal);
      const jsonText = response.text.trim();
      const parsedSuggestions = JSON.parse(jsonText);
      setSuggestions(parsedSuggestions);
    } catch (e) {
      console.error(e);
      setError('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    try {
      const response = await generateMealFromIngredients(ingredients);
      const jsonText = response.text.trim();
      const parsedRecipe = JSON.parse(jsonText);
      setGeneratedRecipe(parsedRecipe);
    } catch (e) {
      console.error(e);
      setError('Failed to generate recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveRecipe = () => {
    if (!generatedRecipe) return;

    const parsedIngredients = generatedRecipe.ingredients.map(ingStr => {
      const parts = ingStr.split(' ');
      const quantity = parseFloat(parts[0]) || 1;
      const unit = parts.length > 2 ? parts[1] : '';
      const name = parts.length > 2 ? parts.slice(2).join(' ') : parts.slice(1).join(' ');
      return { id: crypto.randomUUID(), name, quantity, unit, calories: 0, protein: 0, carbs: 0, fat: 0 };
    });

    const newMeal: Omit<Meal, 'id'> = {
      name: generatedRecipe.mealName,
      servings: 1,
      ingredients: parsedIngredients,
      caloriesPerServing: 0,
      proteinPerServing: 0,
      carbsPerServing: 0,
      fatPerServing: 0,
    };
    addMeal(newMeal);
    alert('Recipe saved to your meals!');
    setGeneratedRecipe(null);
    setIngredients('');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-center bg-gray-200 rounded-lg p-1">
        <button
          onClick={() => setActiveFeature('suggestions')}
          className={`w-1/2 py-2 rounded-md font-semibold ${activeFeature === 'suggestions' ? 'bg-white shadow' : 'text-gray-600'}`}
        >
          Meal Suggestions
        </button>
        <button
          onClick={() => setActiveFeature('recipe')}
          className={`w-1/2 py-2 rounded-md font-semibold ${activeFeature === 'recipe' ? 'bg-white shadow' : 'text-gray-600'}`}
        >
          Generate Recipe
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

      {activeFeature === 'suggestions' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-text-secondary mb-1">Select your goal:</label>
            <select id="goal" value={goal} onChange={e => setGoal(e.target.value as 'bulking' | 'cutting')} className="w-full p-2 border border-gray-300 rounded-md bg-slate-50">
              <option value="bulking">Bulking</option>
              <option value="cutting">Cutting</option>
            </select>
          </div>
          <button onClick={handleGetSuggestions} disabled={isLoading} className="w-full bg-primary text-white font-bold py-2 px-4 rounded disabled:bg-opacity-50">
            {isLoading ? 'Getting suggestions...' : 'Get Suggestions'}
          </button>
          
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-surface rounded-lg shadow p-4">
                <h3 className="font-bold text-text-primary pb-2 border-b">{s.mealName}</h3>
                <p className="text-sm text-text-secondary mt-2">{s.description}</p>
                <p className="text-xs text-text-secondary mt-2">~{s.calories} kcal, {s.protein}g protein</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFeature === 'recipe' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-text-secondary mb-1">Enter ingredients you have (comma separated):</label>
            <textarea
              id="ingredients"
              rows={3}
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              placeholder="e.g., chicken breast, rice, broccoli, soy sauce"
              className="w-full p-2 border border-gray-300 rounded-md bg-slate-50"
            />
          </div>
          <button onClick={handleGenerateRecipe} disabled={isLoading} className="w-full bg-primary text-white font-bold py-2 px-4 rounded disabled:bg-opacity-50">
            {isLoading ? 'Generating...' : 'Generate Recipe'}
          </button>

          {generatedRecipe && (
            <div className="bg-surface rounded-lg shadow p-4 space-y-4">
                <div className="flex justify-between items-start pb-2 border-b">
                    <div>
                        <h3 className="text-xl font-bold text-text-primary">{generatedRecipe.mealName}</h3>
                        <p className="text-sm text-text-secondary mt-1">{generatedRecipe.description}</p>
                    </div>
                    <button onClick={handleSaveRecipe} className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded">Save</button>
                </div>
              <div>
                <h4 className="font-semibold mb-2">Ingredients:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {generatedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside text-sm space-y-2">
                  {generatedRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
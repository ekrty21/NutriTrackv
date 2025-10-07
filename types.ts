
export enum Tab {
  Tracker = 'Tracker',
  Meals = 'Meals',
  AIPlanner = 'AI Planner',
  GroceryList = 'Grocery List',
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  servings: number;
  ingredients: Ingredient[];
  // Per serving
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
}

export interface DailyLogEntry {
  id: string;
  mealId: string;
  mealName: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

export interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeeklyPlan {
  [mealId: string]: number; // mealId: numberOfServings
}

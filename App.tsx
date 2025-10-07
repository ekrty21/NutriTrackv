import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
// FIX: Import Tab as a value to use its enum members, while keeping others as types.
import { Tab, type Meal, type Goals, type DailyLogEntry } from './types';
import { TrackerTab } from './tabs/TrackerTab';
import { MealsTab } from './tabs/MealsTab';
import { AiPlannerTab } from './tabs/AiPlannerTab';
import { GroceryListTab } from './tabs/GroceryListTab';
import { Icon } from './components/Icon';
import type { IconName } from './components/Icon';

// FIX: Use Tab enum for `id` properties for type safety.
const TABS: { id: Tab; icon: IconName }[] = [
    { id: Tab.Tracker, icon: 'tracker' },
    { id: Tab.Meals, icon: 'meals' },
    { id: Tab.AIPlanner, icon: 'ai' },
    { id: Tab.GroceryList, icon: 'grocery' },
];

const DEFAULT_GOALS: Goals = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80,
};

function App() {
    // FIX: Initialize state with a Tab enum member for type safety.
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Tracker);
    const [goals, setGoals] = useLocalStorage<Goals>('nutritrack-goals', DEFAULT_GOALS);
    const [meals, setMeals] = useLocalStorage<Meal[]>('nutritrack-meals', []);
    const [dailyLog, setDailyLog] = useLocalStorage<DailyLogEntry[]>('nutritrack-dailyLog', []);

    // Meal CRUD
    const addMeal = (mealData: Omit<Meal, 'id'>) => {
        const newMeal = { ...mealData, id: crypto.randomUUID() };
        setMeals([...meals, newMeal]);
    };

    const updateMeal = (updatedMeal: Meal) => {
        setMeals(meals.map(m => m.id === updatedMeal.id ? updatedMeal : m));
    };

    const deleteMeal = (id: string) => {
        setMeals(meals.filter(m => m.id !== id));
    };

    // Daily Log
    const addEntryToLog = (mealId: string, servings: number) => {
        const meal = meals.find(m => m.id === mealId);
        if (!meal) return;
        const newEntry: DailyLogEntry = {
            id: crypto.randomUUID(),
            mealId,
            mealName: meal.name,
            servings,
            calories: meal.caloriesPerServing * servings,
            protein: meal.proteinPerServing * servings,
            carbs: meal.carbsPerServing * servings,
            fat: meal.fatPerServing * servings,
            timestamp: new Date().toISOString(),
        };
        setDailyLog([...dailyLog, newEntry]);
    };
    
    const removeEntryFromLog = (entryId: string) => {
        setDailyLog(dailyLog.filter(entry => entry.id !== entryId));
    };

    const renderTab = () => {
        // FIX: Use Tab enum members in switch cases for consistency and type safety.
        switch (activeTab) {
            case Tab.Tracker:
                return <TrackerTab goals={goals} meals={meals} dailyLog={dailyLog} addEntryToLog={addEntryToLog} removeEntryFromLog={removeEntryFromLog} setGoals={setGoals}/>;
            case Tab.Meals:
                return <MealsTab meals={meals} addMeal={addMeal} updateMeal={updateMeal} deleteMeal={deleteMeal} />;
            case Tab.AIPlanner:
                // FIX: Pass addMeal prop to AiPlannerTab so it can save generated meals.
                return <AiPlannerTab addMeal={addMeal} />;
            case Tab.GroceryList:
                return <GroceryListTab meals={meals} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen font-sans">
            <header className="bg-surface shadow-md p-4 z-10">
                <h1 className="text-2xl font-bold text-center text-primary">NutriTrack AI</h1>
            </header>
            <main className="flex-1 overflow-y-auto pb-20">
                {renderTab()}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 flex justify-around">
                {TABS.map(({ id, icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 ${activeTab === id ? 'text-primary' : 'text-text-secondary'}`}
                    >
                        <Icon name={icon} className="w-6 h-6 mb-1" />
                        <span className="text-xs">{id}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default App;

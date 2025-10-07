import React, { useState, useMemo } from 'react';
import { type Meal, type WeeklyPlan } from '../types';
import { Icon } from '../components/Icon';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface GroceryListTabProps {
  meals: Meal[];
}

export const GroceryListTab: React.FC<GroceryListTabProps> = ({ meals }) => {
  const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan>('nutritrack-weeklyPlan', {});
  const [manualList, setManualList] = useLocalStorage<{ id: string; text: string; completed: boolean }[]>('nutritrack-manualList', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const addMealToPlan = (mealId: string, servings: number) => {
    setWeeklyPlan(prev => ({ ...prev, [mealId]: (prev[mealId] || 0) + servings }));
  };
  
  const removeMealFromPlan = (mealId: string) => {
    setWeeklyPlan(prev => {
      const newPlan = { ...prev };
      delete newPlan[mealId];
      return newPlan;
    });
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      setManualList([...manualList, { id: crypto.randomUUID(), text: newItemText.trim(), completed: false }]);
      setNewItemText('');
    }
  };

  const toggleManualItem = (id: string) => {
    setManualList(manualList.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };
  
  const deleteManualItem = (id: string) => {
    setManualList(manualList.filter(item => item.id !== id));
  };

  const generatedList = useMemo(() => {
    const allIngredients: { [key: string]: { quantity: number; unit: string; name: string } } = {};
    Object.entries(weeklyPlan).forEach(([mealId, servings]) => {
      const meal = meals.find(m => m.id === mealId);
      if (meal) {
        meal.ingredients.forEach(ingredient => {
          const key = `${ingredient.name.trim().toLowerCase()}|${ingredient.unit.trim().toLowerCase()}`;
          if (allIngredients[key]) {
            allIngredients[key].quantity += ingredient.quantity * servings;
          } else {
            allIngredients[key] = {
              quantity: ingredient.quantity * servings,
              unit: ingredient.unit,
              name: ingredient.name,
            };
          }
        });
      }
    });
    return Object.values(allIngredients).sort((a, b) => a.name.localeCompare(b.name));
  }, [weeklyPlan, meals]);

  return (
    <div className="p-4 space-y-6">
      <section className="bg-surface rounded-lg shadow p-4">
        <div className="flex justify-between items-center pb-2 border-b">
          <h2 className="text-lg font-bold">Weekly Meal Plan</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white rounded-full p-1.5 shadow">
            <Icon name="plus" className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {Object.keys(weeklyPlan).length > 0 ? (
            Object.entries(weeklyPlan).map(([mealId, servings]) => {
              const meal = meals.find(m => m.id === mealId);
              return meal ? (
                <div key={mealId} className="flex justify-between items-center text-sm">
                  <p>{meal.name} ({servings} servings)</p>
                  <button onClick={() => removeMealFromPlan(mealId)} className="text-red-500"><Icon name="trash" className="w-5 h-5"/></button>
                </div>
              ) : null;
            })
          ) : <p className="text-text-secondary text-center text-sm py-2">No meals planned yet.</p>}
        </div>
      </section>

      <section className="bg-surface rounded-lg shadow p-4">
        <h2 className="text-lg font-bold pb-2 border-b">Generated Grocery List</h2>
        <div className="mt-4">
          {generatedList.length > 0 ? (
            <ul className="space-y-2">
              {generatedList.map((item, index) => (
                <li key={index} className="flex justify-between text-sm border-b pb-1 last:border-0">
                  <span className="capitalize">{item.name}</span>
                  <span className="text-text-secondary">{`${item.quantity.toLocaleString()} ${item.unit}`}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-text-secondary text-center text-sm py-2">List will appear here once meals are planned.</p>}
        </div>
      </section>

       <section className="bg-surface rounded-lg shadow p-4">
        <h2 className="text-lg font-bold pb-2 border-b">Manual Additions</h2>
        <form onSubmit={handleAddManualItem} className="flex gap-2 mt-4">
          <input 
            type="text" 
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            placeholder="e.g., Paper towels"
            className="flex-grow p-2 border rounded-md bg-slate-50"
          />
          <button type="submit" className="bg-secondary text-white font-bold p-2 rounded-md">Add</button>
        </form>
        <div className="mt-4">
          {manualList.length > 0 ? (
             <ul className="space-y-2">
              {manualList.map(item => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={item.completed} onChange={() => toggleManualItem(item.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                    <span className={item.completed ? 'line-through text-text-secondary' : ''}>{item.text}</span>
                  </span>
                  <button onClick={() => deleteManualItem(item.id)} className="text-red-500"><Icon name="trash" className="w-5 h-5"/></button>
                </li>
              ))}
            </ul>
          ) : <p className="text-text-secondary text-center text-sm py-2">No manual items added yet.</p>}
        </div>
      </section>
      
      {isModalOpen && <AddMealToPlanModal meals={meals} onAdd={addMealToPlan} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

const AddMealToPlanModal: React.FC<{
  meals: Meal[];
  onAdd: (mealId: string, servings: number) => void;
  onClose: () => void;
}> = ({ meals, onAdd, onClose }) => {
  const [selectedMeal, setSelectedMeal] = useState<string>(meals[0]?.id || '');
  const [servings, setServings] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeal && servings > 0) {
      onAdd(selectedMeal, servings);
      onClose();
    }
  };

  if (meals.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
        <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-sm m-4 text-center">
            <h3 className="text-lg font-bold mb-4">No Meals Found</h3>
            <p className="text-text-secondary mb-4">Please create a meal in the 'Meals' tab before planning your week.</p>
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-primary text-white">Go Back</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold mb-4 pb-2 border-b">Add Meal to Plan</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="meal" className="block text-sm font-medium text-text-secondary mb-1">Meal</label>
              <select id="meal" value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)} className="w-full p-2 border rounded-md bg-slate-50" required>
                {meals.map(meal => <option key={meal.id} value={meal.id}>{meal.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-text-secondary mb-1">Number of Servings</label>
              <input id="servings" type="number" min="1" step="1" value={servings} onChange={(e) => setServings(parseInt(e.target.value))} className="w-full p-2 border rounded-md bg-slate-50" required />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-text-secondary">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Add to Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
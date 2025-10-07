import React, { useState, useMemo } from 'react';
import { type Goals, type DailyLogEntry, type Meal } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Icon } from '../components/Icon';

interface TrackerTabProps {
  goals: Goals;
  meals: Meal[];
  dailyLog: DailyLogEntry[];
  addEntryToLog: (mealId: string, servings: number) => void;
  removeEntryFromLog: (entryId: string) => void;
  setGoals: (goals: Goals) => void;
}

export const TrackerTab: React.FC<TrackerTabProps> = ({ goals, meals, dailyLog, addEntryToLog, removeEntryFromLog, setGoals }) => {
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  
  const todayLog = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailyLog.filter(entry => entry.timestamp.startsWith(today));
  }, [dailyLog]);

  const totals = useMemo(() => {
    return todayLog.reduce((acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fat += entry.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todayLog]);

  return (
    <div className="p-4 space-y-6">
      <section className="bg-surface rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Today's Progress</h2>
          <button onClick={() => setIsEditingGoals(true)} className="text-primary">
            <Icon name="edit" />
          </button>
        </div>
        <div className="space-y-4">
          <ProgressBar label="Calories" value={totals.calories} max={goals.calories} unit="kcal" />
          <ProgressBar label="Protein" value={totals.protein} max={goals.protein} unit="g" />
          <ProgressBar label="Carbs" value={totals.carbs} max={goals.carbs} unit="g" />
          <ProgressBar label="Fat" value={totals.fat} max={goals.fat} unit="g" />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Today's Log</h2>
          <button onClick={() => setIsAddingMeal(true)} className="bg-primary text-white rounded-full p-2 shadow-lg">
            <Icon name="plus" />
          </button>
        </div>
        <div className="space-y-3">
          {todayLog.length > 0 ? (
            todayLog.map(entry => (
              <div key={entry.id} className="bg-surface rounded-lg shadow p-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-text-primary">{entry.mealName}</p>
                  <p className="text-sm text-text-secondary">{entry.servings} serving(s) &bull; {Math.round(entry.calories)} kcal</p>
                </div>
                <button onClick={() => removeEntryFromLog(entry.id)} className="text-red-500">
                  <Icon name="trash" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-text-secondary text-center py-4">No meals logged yet today.</p>
          )}
        </div>
      </section>

      {isAddingMeal && <AddMealLogModal meals={meals} onAdd={addEntryToLog} onClose={() => setIsAddingMeal(false)} />}
      {isEditingGoals && <EditGoalsModal currentGoals={goals} onSave={setGoals} onClose={() => setIsEditingGoals(false)} />}
    </div>
  );
};


const AddMealLogModal: React.FC<{
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold mb-4 pb-2 border-b">Log a Meal</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="meal" className="block text-sm font-medium text-text-secondary mb-1">Meal</label>
              <select
                id="meal"
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-slate-50"
                required
              >
                {meals.map(meal => <option key={meal.id} value={meal.id}>{meal.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-text-secondary mb-1">Servings</label>
              <input
                id="servings"
                type="number"
                min="0.1"
                step="0.1"
                value={servings}
                onChange={(e) => setServings(parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md bg-slate-50"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-text-secondary">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const EditGoalsModal: React.FC<{
  currentGoals: Goals;
  onSave: (newGoals: Goals) => void;
  onClose: () => void;
}> = ({ currentGoals, onSave, onClose }) => {
  const [goals, setGoals] = useState(currentGoals);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoals({
      ...goals,
      [e.target.name]: parseInt(e.target.value) || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(goals);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold mb-4 pb-2 border-b">Edit Daily Goals</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-text-secondary">Calories (kcal)</label>
              <input type="number" id="calories" name="calories" value={goals.calories} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-slate-50" />
            </div>
            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-text-secondary">Protein (g)</label>
              <input type="number" id="protein" name="protein" value={goals.protein} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-slate-50" />
            </div>
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-text-secondary">Carbs (g)</label>
              <input type="number" id="carbs" name="carbs" value={goals.carbs} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-slate-50" />
            </div>
            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-text-secondary">Fat (g)</label>
              <input type="number" id="fat" name="fat" value={goals.fat} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-slate-50" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-text-secondary">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};
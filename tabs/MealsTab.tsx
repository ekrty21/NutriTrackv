import React, { useState } from 'react';
import { type Meal, type Ingredient } from '../types';
import { Icon } from '../components/Icon';

interface MealsTabProps {
  meals: Meal[];
  addMeal: (mealData: Omit<Meal, 'id'>) => void;
  updateMeal: (updatedMeal: Meal) => void;
  deleteMeal: (id: string) => void;
}

export const MealsTab: React.FC<MealsTabProps> = ({ meals, addMeal, updateMeal, deleteMeal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const openAddModal = () => {
    setEditingMeal(null);
    setIsModalOpen(true);
  };

  const openEditModal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMeal(null);
  };
  
  const handleSaveMeal = (mealData: Omit<Meal, 'id'>, id?: string) => {
    if (id) {
      updateMeal({ ...mealData, id });
    } else {
      addMeal(mealData);
    }
    closeModal();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary">Your Meals</h2>
        <button onClick={openAddModal} className="bg-primary text-white rounded-full p-2 shadow-lg">
          <Icon name="plus" />
        </button>
      </div>
      <div className="space-y-4">
        {meals.length > 0 ? (
          meals.map(meal => (
            <MealCard key={meal.id} meal={meal} onEdit={openEditModal} onDelete={deleteMeal} />
          ))
        ) : (
          <p className="text-text-secondary text-center py-8">You haven't added any meals yet.</p>
        )}
      </div>

      {isModalOpen && (
        <MealFormModal
          meal={editingMeal}
          onSave={handleSaveMeal}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

const MealCard: React.FC<{ meal: Meal, onEdit: (meal: Meal) => void, onDelete: (id: string) => void }> = ({ meal, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="bg-surface rounded-lg shadow p-4">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-text-primary">{meal.name}</h3>
                <p className="text-sm text-text-secondary">{Math.round(meal.caloriesPerServing)} kcal &bull; {meal.servings} serving(s)</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onEdit(meal)} className="text-primary"><Icon name="edit" /></button>
                <button onClick={() => onDelete(meal.id)} className="text-red-500"><Icon name="trash" /></button>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-text-secondary">
                    <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} />
                </button>
            </div>
        </div>
        {isExpanded && (
            <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Ingredients:</h4>
                <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                    {meal.ingredients.map(ing => <li key={ing.id}>{ing.quantity} {ing.unit} {ing.name}</li>)}
                </ul>
            </div>
        )}
    </div>
  );
};

const MealFormModal: React.FC<{
  meal: Meal | null;
  onSave: (mealData: Omit<Meal, 'id'>, id?: string) => void;
  onClose: () => void;
}> = ({ meal, onSave, onClose }) => {
    const [name, setName] = useState(meal?.name || '');
    const [servings, setServings] = useState(meal?.servings || 1);
    const [ingredients, setIngredients] = useState<Omit<Ingredient, 'id' | 'calories' | 'protein' | 'carbs' | 'fat'>[]>(
      meal?.ingredients.map(({id, calories, protein, carbs, fat, ...rest}) => rest) || [{ name: '', quantity: 0, unit: '' }]
    );
    const [calories, setCalories] = useState(meal?.caloriesPerServing || 0);
    const [protein, setProtein] = useState(meal?.proteinPerServing || 0);
    const [carbs, setCarbs] = useState(meal?.carbsPerServing || 0);
    const [fat, setFat] = useState(meal?.fatPerServing || 0);

    const handleIngredientChange = (index: number, field: keyof Omit<Ingredient, 'id' | 'calories' | 'protein' | 'carbs' | 'fat'>, value: string | number) => {
        const newIngredients = [...ingredients];
        (newIngredients[index] as any)[field] = value;
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);
    };
    
    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mealData = {
            name,
            servings,
            ingredients: ingredients.map(ing => ({...ing, id: crypto.randomUUID(), calories: 0, protein: 0, carbs: 0, fat: 0 })),
            caloriesPerServing: calories,
            proteinPerServing: protein,
            carbsPerServing: carbs,
            fatPerServing: fat,
        };
        onSave(mealData, meal?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-surface rounded-lg shadow-xl p-4 w-full max-w-lg m-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="text-lg font-bold">{meal ? 'Edit Meal' : 'Add Meal'}</h3>
                  <button onClick={onClose}><Icon name="close" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4 pt-4">
                  <div>
                    <label>Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded bg-slate-50" />
                  </div>
                  <div>
                    <label>Servings</label>
                    <input type="number" min="1" value={servings} onChange={e => setServings(Number(e.target.value))} required className="w-full mt-1 p-2 border rounded bg-slate-50" />
                  </div>
                  
                  <h4 className="font-semibold mt-4">Nutrition per Serving</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label>Calories</label><input type="number" min="0" value={calories} onChange={e => setCalories(Number(e.target.value))} required className="w-full mt-1 p-2 border rounded bg-slate-50" /></div>
                    <div><label>Protein (g)</label><input type="number" min="0" value={protein} onChange={e => setProtein(Number(e.target.value))} required className="w-full mt-1 p-2 border rounded bg-slate-50" /></div>
                    <div><label>Carbs (g)</label><input type="number" min="0" value={carbs} onChange={e => setCarbs(Number(e.target.value))} required className="w-full mt-1 p-2 border rounded bg-slate-50" /></div>
                    <div><label>Fat (g)</label><input type="number" min="0" value={fat} onChange={e => setFat(Number(e.target.value))} required className="w-full mt-1 p-2 border rounded bg-slate-50" /></div>
                  </div>
                  
                  <h4 className="font-semibold mt-4">Ingredients</h4>
                  {ingredients.map((ing, i) => (
                      <div key={i} className="flex items-end gap-2">
                          <div className="flex-1"><label className="text-sm">Name</label><input type="text" value={ing.name} onChange={e => handleIngredientChange(i, 'name', e.target.value)} required className="w-full mt-1 p-2 border rounded bg-slate-50" /></div>
                          <div className="w-1/4"><label className="text-sm">Qty</label><input type="number" min="0" step="any" value={ing.quantity} onChange={e => handleIngredientChange(i, 'quantity', Number(e.target.value))} required className="w-full mt-1 p-2 border rounded bg-slate-50" /></div>
                          <div className="w-1/4"><label className="text-sm">Unit</label><input type="text" value={ing.unit} onChange={e => handleIngredientChange(i, 'unit', e.target.value)} required className="w-full mt-1 p-2 border rounded bg-slate-50" /></div>
                          <button type="button" onClick={() => removeIngredient(i)} className="text-red-500 mb-2"><Icon name="trash" /></button>
                      </div>
                  ))}
                  <button type="button" onClick={addIngredient} className="text-primary text-sm font-semibold">+ Add Ingredient</button>

                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                      <button type="button" onClick={onClose} className="px-4 py-2 rounded text-text-secondary">Cancel</button>
                      <button type="submit" className="px-4 py-2 rounded bg-primary text-white">Save Meal</button>
                  </div>
                </form>
            </div>
        </div>
    );
};
import mongoose from 'mongoose';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
const dietaryOptions = [
  'Vegetarian', 
  'Vegan', 
  'Gluten-free', 
  'Dairy-free', 
  'Nut-free', 
  'Keto', 
  'Paleo'
];

const nutritionSchema = new mongoose.Schema({
  calories: String,
  carbohydrates: String,
  protein: String,
  fat: String,
  fiber: String,
  
  // Add other nutrition fields as needed
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  mealType: { 
    type: String, 
    required: true,
    enum: mealTypes 
  },
  allergies: { 
    type: [String], 
    default: [] 
  },
  diet: { 
    type: [String], 
    enum: dietaryOptions,
    default: [] 
  },
  recipe: {
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    nutrition: { type: nutritionSchema, required: true }
  },
 imageUrl: { type: String },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Recipe', recipeSchema);
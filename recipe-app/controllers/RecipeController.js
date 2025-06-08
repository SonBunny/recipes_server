import Recipe from '../model/RecipeSchema.js';
import OpenAI from 'openai';
import parseGeneratedRecipe from './utils/parseGeneratedRecipe.js';
import generateRecipeImage from './utils/generateRecipeImage.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to find similar recipes
const findSimilarRecipes = async (ingredients, mealType) => {
  return await Recipe.find({
    ingredients: { $in: ingredients.map(i => i.toLowerCase()) },
    mealType
  }).sort({ createdAt: -1 }).limit(3);
};

export const generateRecipe = async (req, res) => {
  try {
    const { mealType, ingredients, allergies, diet, nutrition, regenerate } = req.body;

    // Validation
    if (!mealType || !ingredients?.length) {
      return res.status(400).json({ error: "Missing mealType or ingredients" });
    }

    // Check cache unless regeneration requested
    if (!regenerate) {
      const similarRecipes = await findSimilarRecipes(ingredients, mealType);
      if (similarRecipes.length > 0) {
        return res.json({
          recipe: similarRecipes[0].recipe, // Return just the first match
          source: 'database',
          canRegenerate: true
        });
      }
    }
    const allergiesList = allergies?.join(', ') || 'none';
    const dietList = diet?.join(', ') || 'no specific diet';
    const nutritionList = nutrition?.join(', ') || 'standard';

    // Build optimized prompt
    const prompt = `
      ${mealType} recipe | Ingredients: ${ingredients.join(', ')}
      NO: ${allergiesList} | Diet: ${dietList}
      Nutrition: ${nutritionList} | Format: Title:,Ingredients:,Instructions:,Nutritional Info: |`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You create 1 short recipes w/nutrition info. " 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 450 // Reduced to prevent extra output
    });

    const generatedText = response.choices[0].message.content;
    console.log("ORIGINAL");
    console.log(generatedText);
    const parsedRecipe = parseGeneratedRecipe(generatedText);
    console.log("PARSED");
    console.log(parsedRecipe);
    const imageBase64 = await generateRecipeImage(
      parsedRecipe.title,
      parsedRecipe.ingredients,
      "professional food photography"
    );

    const newRecipe = await Recipe.create({
      mealType,
      ingredients: ingredients.map(i => i.toLowerCase()),
      allergies: allergies || [],
      diet: diet || [],
      recipe: parsedRecipe,
      imageUrl: imageBase64 || null
    });


    res.json({ 
      recipe: parsedRecipe,
      imageUrl: imageBase64,
      source: 'openai',
      isNew: true ,
      _id: newRecipe._id
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Recipe generation failed" });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    res.json({
      mealTypes: Recipe.schema.path('mealType').enumValues,
      dietaryOptions: Recipe.schema.path('diet').enumValues
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch filter options" });
  }
};

// Get filtered recipes
export const getRecipes = async (req, res) => {
  try {
    const { 
      mealType, 
      ingredients, 
      diet, 
      excludeAllergies, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};
    
    // Meal type filter
    if (mealType) {
      query.mealType = Array.isArray(mealType) ? { $in: mealType } : mealType;
    }
    
    // Ingredients filter
    if (ingredients) {
      query.ingredients = { 
        $in: Array.isArray(ingredients) ? 
          ingredients.map(i => i.toLowerCase()) : 
          [ingredients.toLowerCase()] 
      };
    }
    
    // Dietary preferences filter
    if (diet) {
      query.diet = Array.isArray(diet) ? { $all: diet } : diet;
    }
    
    // Allergy exclusion filter
    if (excludeAllergies) {
      query.allergies = { 
        $nin: Array.isArray(excludeAllergies) ? 
          excludeAllergies : 
          [excludeAllergies] 
      };
    }

    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Recipe.countDocuments(query)
    ]);

    res.json({
      recipes,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      filters: {
        mealType,
        ingredients,
        diet,
        excludeAllergies
      }
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
};

// Get single recipe by ID
export const getRecipeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Recipe ID is required" });
    }

    const recipe = await Recipe.findById(id);
    console.log(recipe);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json({
      recipe: {
        ...recipe.toObject(),
        // Include any additional transformations if needed
      }
    });
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    res.status(500).json({ error: "Failed to fetch recipe details" });
  }
};
import express from 'express';
import { generateRecipe, getRecipes ,getFilterOptions,getRecipeDetails} from '../controllers/RecipeController.js';

const router = express.Router();

router.post('/generate', generateRecipe);
router.get('/', getRecipes);
router.get('/filters', getFilterOptions);
router.get('/:id', getRecipeDetails);

export default router;
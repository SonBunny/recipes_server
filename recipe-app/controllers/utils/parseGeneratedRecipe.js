function parseGeneratedRecipe(generatedText) {

    console.log(generatedText);
  const lines = generatedText.split('\n').filter(line => line.trim() !== '');
  
  const result = {
    title: lines[0].trim(), // Get first line as title
    ingredients: [],
    instructions: [],
    nutrition: {}
  };
  
  let currentSection = null;
  
  // Start from line 1 (skip the title we already processed)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('Ingredients:')) {
      currentSection = 'ingredients';
    } else if (line.startsWith('Instructions:')) {
      currentSection = 'instructions';
    } else if (line.startsWith('Nutritional Info:')) {
      currentSection = 'nutrition';
    } else {
      switch (currentSection) {
        case 'ingredients':
          if (line.startsWith('- ')) {
            result.ingredients.push(line.substring(2).trim());
          }
          break;
        case 'instructions':
          if (/^\d+\./.test(line)) {
            result.instructions.push(line.replace(/^\d+\.\s*/, '').trim());
          }
          break;
        case 'nutrition':
          const [key, value] = line.split(':').map(part => part.trim());
          if (key && value) {
            result.nutrition[key.toLowerCase()] = value;
          }
          break;
      }
    }
  }
  
  return result;
}

export default parseGeneratedRecipe;
// utils/generateImage.js
import fs from "fs";
import FormData from "form-data";

import axios from "axios";


async function generateRecipeImage(recipeTitle, ingredients, style = "professional food photography") {
  try {
    const prompt = `${recipeTitle}, ${ingredients} should be the ingredients , ${style}, high resolution, appetizing, well-lit`;
    
    const payload = {
      prompt: prompt,
      output_format: "jpeg",
      model: "sd3", // or "sd3-turbo" for faster generation
      aspect_ratio: "16:9" // or "1:1" for square images
    };

    const formData = new FormData();
    for (const key in payload) {
      formData.append(key, payload[key]);
    }

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      formData,
      {
        headers: { 
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*",
          ...formData.getHeaders()
        },
        responseType: "arraybuffer"
      }
    );

    if (response.status === 200) {
      // Convert the image to base64 for easy storage
      return `data:image/jpeg;base64,${Buffer.from(response.data).toString('base64')}`;
    } else {
      console.error("Image generation failed:", response.status, response.data.toString());
      return null;
    }
  } catch (error) {
    console.error("Error generating recipe image:", error);
    return null;
  }
}

export default generateRecipeImage;
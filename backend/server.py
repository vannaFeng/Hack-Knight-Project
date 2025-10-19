from flask import Flask, request, jsonify
import tempfile
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

client = genai.Client(api_key=api_key)

def analyze_image(imagepath, mime_type):
    with open(imagepath, 'rb') as f:
        image_bytes = f.read()

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            ),
            """
            Analyze the image and return a single JSON object listing all detected food items found inside a refrigerator.
            Each key should be the item's name, and each value should be a JSON object containing the item's estimated quantity and price per unit.

            Requirements:
            Include only items that are food or beverages typically stored in a fridge.
            If no valid food items are detected, return exactly:{ "Invalid": 0 }

            Formatting rules:
            "Quantity" should be an integer if the item is countable (e.g., eggs, bottles) or "multiple" if it cannot be precisely counted.
            "PricePerUnit" should be a floating-point number (e.g., 1.25), representing the approximate cost per item or per unit weight.
            All prices must be in U.S. dollars.
            Every item must include both "Quantity" and "PricePerUnit" fields.
            Output must be valid JSON only (no explanations, no text outside the JSON).

            Example output:
            {
            "Eggs": { "Quantity": 6, "PricePerUnit": 0.50 },
            "Packaged Meat (Sausage)": { "Quantity": 1, "PricePerUnit": 3.00 },
            "Red Cabbage": { "Quantity": 1, "PricePerUnit": 1.50 },
            "Lettuce": { "Quantity": "multiple", "PricePerUnit": 1.00 },
            "Cucumber": { "Quantity": 1, "PricePerUnit": 1.25 },
            "Tomatoes": { "Quantity": "multiple", "PricePerUnit": 0.75 },
            "Carrots": { "Quantity": "multiple", "PricePerUnit": 0.30 },
            "Herbs (Dill/Parsley)": { "Quantity": "multiple", "PricePerUnit": 0.25 },
            "Red Onion": { "Quantity": 1, "PricePerUnit": 0.80 },
            "Romanesco Broccoli/Cauliflower": { "Quantity": 2, "PricePerUnit": 2.50 },
            "Green Cabbage": { "Quantity": 1, "PricePerUnit": 1.75 },
            "Kale": { "Quantity": "multiple", "PricePerUnit": 1.00 },
            "Yogurt/Cream Jars": { "Quantity": 3, "PricePerUnit": 1.50 }
            }
            """
        ]
    )

    print(response.text)
    return response


@app.route('/vision', methods=['POST', 'OPTIONS'])
def vision():
    # Handle preflight (CORS OPTIONS) requests
    if request.method == 'OPTIONS':
        return '', 200

    file = request.files.get('image_file')
    if not file:
        return jsonify({'error': 'No file provided'}), 400

    mime_type = file.mimetype
    if not mime_type.startswith('image/'):
        return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400

    # Correct file extension for temp file
    extension = mime_type.split('/')[-1]
    if extension == 'jpeg':
        extension = 'jpg'

    with tempfile.NamedTemporaryFile(suffix=f'.{extension}', delete=False) as tmp:
        file.save(tmp.name)
        temp_path = tmp.name

    try:
        result = analyze_image(temp_path, mime_type)
        return jsonify({"result": result.text})
    finally:
        os.remove(temp_path)


@app.route('/generate_recipe', methods=['POST', 'OPTIONS'])
def generate_recipe():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()

    # Validate incoming JSON
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'Invalid JSON format. Expected a dictionary.'}), 400

    # Extract and filter ingredients
    ignore_keys = ["Allergies"]
    allergies = data.get("Allergies", "").strip().lower()
    ingredients = {k: v for k, v in data.items() if k not in ignore_keys}

    if not ingredients:
        return jsonify({'error': 'No valid ingredients provided.'}), 400

    # Construct Gemini prompt
    prompt = f"""
    You are a culinary AI assistant. Based on the following fridge inventory, create creative yet realistic recipes.

    Food Inventory (with Quantity and PricePerUnit):
    {json.dumps(ingredients, indent=2)}

    Allergy Information: {allergies if allergies else "None"}

    Requirements:
    - Return a single valid JSON object.
    - Each key should be the recipe name (dish name).
    - Each recipe must include:
        1. "Ingredients": a list of JSON objects with "name" and "amount" fields.
        2. "NutritionalValues (Estimated)": a JSON object with "Calories", "Protein (g)", "Fat (g)", and "Carbohydrates (g)".
        3. "AverageCostOfDishOutside (Estimated)" (float).
        4. "MoneySavedIfMade" (float).
    - Give multiples recipes about 10 to 15.
    - Use available ingredients only.
    - Avoid any ingredients containing or derived from {allergies} if listed.
    - Output must be **valid JSON only** — no explanations, no markdown, no comments.
    - Follow this exact JSON format example below:

    {{
      "Savory Sausage and Cabbage Egg Scramble": {{
        "Ingredients": [
          {{"name": "Packaged Meat (Sausage)", "amount": "0.5 unit"}},
          {{"name": "Green Cabbage", "amount": "0.25 unit"}},
          {{"name": "Red Onion", "amount": "0.25 unit"}},
          {{"name": "Eggs", "amount": "2 units"}},
          {{"name": "Herbs (Dill/Parsley)", "amount": "small sprig"}}
        ],
        "NutritionalValues (Estimated)": {{
          "Calories": 350,
          "Protein (g)": 20,
          "Fat (g)": 25,
          "Carbohydrates (g)": 10
        }},
        "AverageCostOfDishOutside (Estimated)": 10.50,
        "MoneySavedIfMade": 8.10
      }},
      "Rainbow Root Salad with Lemon-Herb Dressing": {{
        "Ingredients": [
          {{"name": "Carrots", "amount": "2 units"}},
          {{"name": "Red Cabbage", "amount": "0.5 unit"}},
          {{"name": "Romanesco Broccoli/Cauliflower", "amount": "0.5 unit"}},
          {{"name": "Lettuce", "amount": "1 handful"}},
          {{"name": "Herbs (Dill/Parsley)", "amount": "medium sprig"}}
        ],
        "NutritionalValues (Estimated)": {{
          "Calories": 180,
          "Protein (g)": 8,
          "Fat (g)": 5,
          "Carbohydrates (g)": 25
        }},
        "AverageCostOfDishOutside (Estimated)": 12.00,
        "MoneySavedIfMade": 9.45
      }}
    }}
    """

    try:
        # Generate recipe using Gemini
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt]
        )

        # Return Gemini's JSON output directly
        result_text = response.text.strip()
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        return result_text, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        return jsonify({'error': str(e)}), 500

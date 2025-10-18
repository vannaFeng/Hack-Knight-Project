from flask import Flask, request, jsonify
import tempfile
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
app = Flask(__name__)
client = genai.Client(api_key=api_key)

def analyze_image(imagepath,mime_type):
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
        Label each object and return a JSON file that indicates the name and quantity.  
        Each object should have its own JSON entry. Thus, the total JSON should be a nested JSON of JSON objects.  

        Only include items that are from the fridge and related to food.  
        If the item is not related to food, return the JSON:
            { "Invalid": 0 }

        Example format:
        {
            "Pie": { "Quantity": 1 },
            "Peaches": { "Quantity": 2 },
            "Water Bottle": { "Quantity": 1 },
            "Apricots": { "Quantity": "multiple" },
            "Blueberries": { "Quantity": "multiple" },
            "Bananas": { "Quantity": 3 },
            "Grapes": { "Quantity": "multiple" },
            "Orange Juice Bottles": { "Quantity": 2 },
            "Packaged Meat (Sausage)": { "Quantity": 1 },
            "Cheese (Round, Foil-Wrapped)": { "Quantity": 2 },
            "Packaged Chicken": { "Quantity": "multiple" },
            "Red Bell Pepper": { "Quantity": 1 },
            "Yellow Bell Peppers": { "Quantity": 2 },
            "Yogurt/Cream Jars": { "Quantity": 3 }
        }
        """
    ]
    )

    print(response.text)
    return response

@app.post('/vision')
def vision():
    file = request.files['image_file']
    mime_type = file.mimetype

    if not mime_type.startswith('image/'):
        return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400

   
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

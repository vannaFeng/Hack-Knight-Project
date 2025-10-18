# WhatTheFridge 

# Backend Setup Guide

How to set up and run the Flask backend for the project?

## Steps

1. Navigate to the backend directory
```bash
cd ./backend
```

2. Create and activate a virtual environment
```bash
py -3 -m venv .venv
```
3. Activate virtual enviroment based on OS
- macOS/Linux
```bash
source .venv/bin/activate
```
- Windows (Command Prompt)
```cmd
.venv\Scripts\activate
```

- Windows (PowerShell)
```powershell
.venv\Scripts\Activate.ps1
```

4. Install dependencies
```bash
pip install Flask
pip install google-genai
pip install python-dotenv
```
5. Create a .env file in the backend directory
- You can generate one here: [Create a Google API Key](https://aistudio.google.com/api-keys)
Add your Google API key inside:
```env
GOOGLE_API_KEY=your_api_key_here
```

6. Run the Flask server
```bash
flask --app server run
```

## API Documentation

| **Endpoint** | **Method** | **Description** | **Request Body** | **Response Examples** |
|---------------|-------------|------------------|------------------|------------------------|
| `/vision` | `POST` | Uploads an image file and analyzes its contents using the **Gemini Vision API**. Returns a JSON list of detected food items and their quantities. If no food items are detected, returns `{ "Invalid": 0 }`. | **form-data**:• `image_file` — *(required)* The image file to analyze (`.jpg`, `.jpeg`, `.png`). | **Success (200):** ```{ "result": { "apple": 2, "milk": 1 } }```<br><br>**No Food Detected (200):**```{ "result": { "Invalid": 0 } }<br>```<br><br>**Error (400):**```{ "error": "Invalid file type. Please upload an image." }``` |



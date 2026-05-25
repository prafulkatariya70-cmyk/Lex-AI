from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import fitz
import os
from groq import Groq

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key="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")

def extract_text_from_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def analyze_contract(text):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": """You are an expert legal AI assistant. 
                Analyze contracts and return a JSON response with these fields:
                - summary: 2-3 sentence plain English summary
                - risk_level: Low / Medium / High
                - key_clauses: list of 3-5 important clauses found
                - red_flags: list of any risky or unusual terms
                - recommendations: list of 2-3 suggested actions
                Return only valid JSON, nothing else."""
            },
            {
                "role": "user",
                "content": f"Analyze this contract:\n\n{text[:4000]}"
            }
        ]
    )
    return response.choices[0].message.content

@app.get("/")
def root():
    return {"status": "LexAI backend is running"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    result = analyze_contract(text)
    return {"analysis": result}
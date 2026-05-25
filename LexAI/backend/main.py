from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import fitz
import os
from groq import Groq

load_dotenv()

app = FastAPI()

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content={}, status_code=200)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
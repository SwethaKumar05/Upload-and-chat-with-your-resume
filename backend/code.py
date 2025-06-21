import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAI
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader
import os, shutil, uuid

from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.docstore.document import Document
from langchain.embeddings.base import Embeddings
from typing import Dict

load_dotenv(dotenv_path="backend/.env")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
llm = GoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY)


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#`llm = ChatGoogleGenerativeAI(model="gemini-pro")
embedding = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key= os.getenv("GOOGLE_API_KEY")  # this uses the .env key!
)



vector_stores: Dict[str, FAISS] = {}

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    temp_dir = f"temp/{file_id}"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    reader = PdfReader(file_path)
    text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(text)]

    db = FAISS.from_documents(docs, embedding)
    vector_stores[file_id] = db

    return {"message": "Resume uploaded and indexed.", "file_id": file_id}

@app.post("/ask")
async def ask_question(file_id: str = Form(...), query: str = Form(...)):
    if file_id not in vector_stores:
        return JSONResponse(status_code=404, content={"error": "Invalid file ID."})

    retriever = vector_stores[file_id].as_retriever()
    qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
    answer = qa_chain.run(query)

    return {"answer": answer}

@app.post("/fit-score")
async def fit_score(file_id: str = Form(...), job_description: str = Form(...)):
    if file_id not in vector_stores:
        return JSONResponse(status_code=404, content={"error": "Invalid file ID."})

    retriever = vector_stores[file_id].as_retriever()
    qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)

    prompt_score = f"Given this job description: '{job_description}', how well does this resume match the role? Give a score out of 10 with a short justification."
    score_response = qa_chain.run(prompt_score)

    prompt_suggestion = f"Given this resume and the job role: '{job_description}', suggest improvements to the resume so that it fits the role better."
    suggestion_response = qa_chain.run(prompt_suggestion)

    return {
        "score": score_response,
        "suggestions": suggestion_response
    }
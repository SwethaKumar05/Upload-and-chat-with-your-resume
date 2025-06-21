# Upload-and-chat-with-your-resume
This AI-powered web application allows users to upload their resume (PDF), ask questions about its content, and assess how well it fits a specific job role using Google’s Gemini LLM. The tool provides a fit score and personalized suggestions to improve the resume for better job alignment.

# Features
  1. Upload your résumé in PDF format
  2. Ask natural language questions like:
  
      "What are my strongest skills?"
      "Do I have experience in team leadership?"
      
  3. Get a fit score out of 10 based on a provided job role
  4. Receive tailored suggestions to optimize your résumé for better job alignment

# Architecture Diagram

User (Browser)

     |
     
     v
     
Next.js Frontend (React + Tailwind)

     |
     
     | (1) Upload Resume (.pdf)
     
     | (2) Ask Query or Submit Role
     
     v
     
FastAPI Backend (Python)

     |
     
     |---> Parse PDF using PyPDF2
     
     |---> Embed using GoogleGenerativeAIEmbeddings
     
     |---> Store in FAISS vector DB
     
     |---> RAG with Gemini (LangChain RetrievalQA)
     
     v
     
Google Gemini API (LLM + Embedding API)

# Tech Stack

  **Frontend:** Next.js (React) + Tailwind CSS
  **Backend:** FastAPI (Python)
  **AI Models:** Google Gemini 1.5 Flash (gemini-2.0-flash) + Embeddings (embedding-001)
  **Vector DB:** FAISS for semantic search
  **Libraries:** LangChain, PyPDF2, dotenv, FormData, CORS Middleware

# Project Structure 

📁 next-js/

├── backend/

│   ├── code.py            # FastAPI backend endpoints

│   ├── .env               # Contains your Google API Key

│   └── ...

├── src/

│   └── app/

│       ├── page.tsx       # Next.js frontend logic

│       └── layout.tsx     # Global layout

├── public/                # Static files

└── ...

# Setup Instructions

step 1. Prerequisites
 
Node.js v18+

Python 3.10+

Google Gemini API Key

Step 2. 
Create a .env file inside backend/:

GOOGLE_API_KEY=your_real_google_api_key
   
Run the FastAPI backend:

uvicorn backend.code:app --reload --port 8000

Step 3:
Setup Frontend (Next.js)

npm install

Create a .env.local file in root:

NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

Start the frontend:

npm run dev

# Trade off

| Trade-off                     | Justification                                                                |
| ------------------------------| ---------------------------------------------------------------------------- |
|  **Gemini API key in `.env`** | Keeps API secure; requires local setup unless deployed with secrets manager  |
|  **LLM Query Cost**           | Using Gemini Flash for faster, cheaper inference                             |
|  **Only PDF supported**       | Simpler file handling; can be extended to `.docx`, `.txt` in the future      |
|  **Local FAISS vector store** | Fast in-memory embedding retrieval; for production, consider Qdrant/Pinecone |
|  **Allow-Origin = '\*'**      | For development; in production use domain-specific CORS config               |


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

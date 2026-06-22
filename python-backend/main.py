"""
CareerForge AI — Python Backend Service
Wraps existing ResumeAI agent, exporter, and schemas into a FastAPI REST API.
"""
import os
import sys
import json
import io
import base64
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env files
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Lazy imports - don't crash if AI deps are missing
fitz = None
ResumeData = None

def _load_fitz():
    global fitz
    if fitz is None:
        import fitz as _fitz
        fitz = _fitz

def _load_schemas():
    global ResumeData
    if ResumeData is None:
        from schemas import ResumeData as _ResumeData
        ResumeData = _ResumeData

app = FastAPI(title="CareerForge AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://careerforge-ai.vercel.app",
        "https://careerforge-ai-nine.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the LangGraph interview agent router
from app.routes.interview import router as interview_router
app.include_router(interview_router)

# ─── Request Schemas ────────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    resume: Dict[str, Any]
    instructions: str = "Improve this resume to be more impactful and professional."
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    tavily_api_key: Optional[str] = None

class SuggestionsRequest(BaseModel):
    resume: Dict[str, Any]
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

class ExportExcelRequest(BaseModel):
    resume: Dict[str, Any]

class ExportHtmlRequest(BaseModel):
    resume: Dict[str, Any]
    template_name: str = "dublin"

class MatchScoreRequest(BaseModel):
    resume: Dict[str, Any]
    job_description: str

class InterviewQuestionsRequest(BaseModel):
    resume: Dict[str, Any]
    job_title: str
    job_description: Optional[str] = None
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

class InterviewFeedbackRequest(BaseModel):
    resume: Dict[str, Any]
    job_title: str
    questions: List[Dict[str, Any]]
    answers: List[Dict[str, Any]]
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

class ParseRequest(BaseModel):
    file_name: str
    file_base64: str

class CoverLetterRequest(BaseModel):
    sender_name: str
    sender_title: str
    company_name: str
    job_title: str
    bullet_points: Optional[List[str]] = None
    tone: Optional[str] = "professional"
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None

# ─── Helper ─────────────────────────────────────────────────────────

def get_pdf_text(file_bytes: bytes) -> str:
    """Extract text from PDF bytes in-memory using PyMuPDF."""
    try:
        _load_fitz()
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            page_text = page.get_text("text")
            if page_text:
                text += page_text + "\n"
        doc.close()
        return text.strip()
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def get_docx_text(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes in-memory using zipfile and xml parsing."""
    try:
        pdf_file = io.BytesIO(file_bytes)
        with zipfile.ZipFile(pdf_file) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # XML namespaces
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for p in root.findall('.//w:p', ns):
                text_runs = []
                for r in p.findall('.//w:r', ns):
                    t = r.find('.//w:t', ns)
                    if t is not None and t.text:
                        text_runs.append(t.text)
                if text_runs:
                    paragraphs.append("".join(text_runs))
            
            return "\n".join(paragraphs).strip()
    except Exception as e:
        return f"Error reading docx: {str(e)}"

def get_llm(groq_key: str = None, openai_key: str = None, temperature: float = 0.3):
    """Get available LLM, prefer OpenAI (GPT-4o), fallback to Groq."""
    from models import get_groq_llm, get_openai_llm
    openai_key = openai_key or os.environ.get("OPENAI_API_KEY")
    groq_key = groq_key or os.environ.get("GROQ_API_KEY")

    if openai_key:
        try:
            return get_openai_llm(api_key=openai_key, temperature=temperature), "openai"
        except Exception as e:
            print(f"OpenAI init failed: {e}")

    if groq_key:
        try:
            return get_groq_llm(api_key=groq_key, temperature=temperature), "groq"
        except Exception as e:
            print(f"Groq init failed: {e}")

    raise HTTPException(status_code=400, detail="No LLM API keys configured. Provide openai_api_key or groq_api_key.")

def clean_json_response(content: str) -> str:
    """Clean markdown wrappers from LLM JSON responses."""
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    return content.strip()

# ─── Endpoints ──────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "careerforge-ai-backend"}

@app.post("/api/optimize")
async def optimize_resume(req: OptimizeRequest):
    """
    Full AI-powered resume rewrite using the deep agent.
    Uses Tavily web search for role research.
    """
    try:
        from agent import refine_resume_with_agent
        result = refine_resume_with_agent(
            current_resume_dict=req.resume,
            refinement_instructions=req.instructions,
            groq_api_key=req.groq_api_key,
            openai_api_key=req.openai_api_key,
            tavily_api_key=req.tavily_api_key,
        )
        if isinstance(result, ResumeData):
            return {"resume": result.model_dump()}
        return {"resume": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/suggestions")
async def get_suggestions(req: SuggestionsRequest):
    """
    Generate 3-5 targeted improvement suggestions.
    """
    try:
        from agent import generate_resume_suggestions
        suggestions = generate_resume_suggestions(
            resume_dict=req.resume,
            groq_api_key=req.groq_api_key,
            openai_api_key=req.openai_api_key,
        )
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export/excel")
async def export_resume_excel(req: ExportExcelRequest):
    """
    Generate a multi-sheet Excel resume file.
    """
    try:
        resume_data = ResumeData(**req.resume)
        excel_bytes = export_to_excel(resume_data)
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=resume.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export/html")
async def export_resume_html(req: ExportHtmlRequest):
    """
    Generate HTML resume with specified template.
    """
    try:
        resume_data = ResumeData(**req.resume)
        html = render_html_resume(resume_data, req.template_name)
        return {"html": html}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/match-score")
async def calculate_match_score(req: MatchScoreRequest):
    """
    Compare resume against a job description and return a match score
    with missing skills and improvement suggestions.
    """
    llm, provider = get_llm(temperature=0.2)

    prompt = f"""You are an expert ATS resume analyzer. Compare the following resume JSON against the job description.
Return a JSON object ONLY (no markdown) with this structure:
{{
  "overall_score": <0-100 integer>,
  "keyword_matches": [<list of matched keywords>],
  "missing_keywords": [<list of important missing keywords from the job description>],
  "skill_gaps": [<list of skills mentioned in the job but missing from the resume>],
  "suggestions": [<list of specific improvement suggestions>],
  "strengths": [<list of strong matches>]
}}

Resume: {json.dumps(req.resume, indent=2)}

Job Description:
{req.job_description}
"""
    response = llm.invoke([{"role": "user", "content": prompt}])
    content = clean_json_response(response.content)

    try:
        result = json.loads(content)
        return result
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"Failed to parse match score. Raw: {content[:500]}")

@app.post("/api/interview/questions")
async def generate_interview_questions(req: InterviewQuestionsRequest):
    """
    Generate tailored interview questions based on resume and target job.
    """
    llm, provider = get_llm(temperature=0.4)

    prompt = f"""You are an expert interview coach. Generate 5-7 interview questions tailored to this candidate's resume and the target job role.

The questions should include:
- 2-3 behavioral questions (using the STAR format)
- 2-3 technical/skill-based questions
- 1-2 culture-fit/career-goal questions

Return a JSON array ONLY (no markdown):
[
  {{
    "id": 1,
    "type": "behavioral" | "technical" | "cultural",
    "question": "The question text",
    "focus_area": "What skill/aspect this tests",
    "tips": "Brief tip on how to approach this question"
  }}
]

Resume: {json.dumps(req.resume, indent=2)}
Job Title: {req.job_title}
Job Description: {req.job_description or "Not provided"}
"""
    response = llm.invoke([{"role": "user", "content": prompt}])
    content = clean_json_response(response.content)

    try:
        questions = json.loads(content)
        return {"questions": questions}
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"Failed to parse questions. Raw: {content[:500]}")

@app.post("/api/interview/feedback")
async def generate_interview_feedback(req: InterviewFeedbackRequest):
    """
    Score interview answers and provide detailed feedback.
    """
    llm, provider = get_llm(temperature=0.3)

    qa_pairs = []
    for q, a in zip(req.questions, req.answers):
        qa_pairs.append(f"Q: {q.get('question', '')}\nA: {a.get('answer', '')}")

    prompt = f"""You are an expert interview evaluator. Score the following interview Q&A session on a scale of 1-100.

Return a JSON object ONLY (no markdown):
{{
  "overall_score": <0-100>,
  "scores": {{
    "relevance": <0-100>,
    "clarity": <0-100>,
    "technical_depth": <0-100>,
    "active_language": <0-100>,
    "star_format": <0-100>
  }},
  "question_scores": [
    {{
      "question_id": <id>,
      "score": <0-100>,
      "strengths": "<what was good>",
      "improvements": "<what could be better>",
      "suggested_answer_hint": "<brief suggestion>"
    }}
  ],
  "strengths": ["<strength1>", "<strength2>"],
  "areas_for_improvement": ["<area1>", "<area2>"],
  "actionable_advice": "<3-4 sentences of specific advice>"
}}

Job Title: {req.job_title}
Resume: {json.dumps(req.resume, indent=2)}

Q&A Session:
{chr(10).join(qa_pairs)}
"""
    response = llm.invoke([{"role": "user", "content": prompt}])
    content = clean_json_response(response.content)

    try:
        feedback = json.loads(content)
        return feedback
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"Failed to parse feedback. Raw: {content[:500]}")

class EnhanceRequest(BaseModel):
    resume_text: str
    job_title: Optional[str] = None
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

@app.post("/api/enhance")
async def enhance_resume(req: EnhanceRequest):
    """
    Fast single-LLM-call resume enhancement (no deepagent, no Tavily).
    Tries OpenAI first, falls back to Groq on rate limit, retries once.
    Parses raw resume text, returns structured ResumeData.
    """
    openai_key = req.openai_api_key or os.environ.get("OPENAI_API_KEY")
    groq_key = req.groq_api_key or os.environ.get("GROQ_API_KEY")

    prompt = f"""You are an expert resume writer and ATS optimization specialist.
Parse the raw resume text below and rewrite/optimize it into a highly professional, high-impact resume.
Your output MUST be a single, valid JSON object matching the exact structure below. Do not include any markdown fences (like ```json), commentary, or extra text.

{{
  "personal_info": {{
    "full_name": "",
    "professional_title": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": null,
    "github": null,
    "website": null,
    "nationality": null,
    "hobbies": null,
    "power_statement": "",
    "photo_base64": null
  }},
  "summary": "",
  "experience": [
    {{
      "company": "",
      "position": "",
      "location": "",
      "start_date": "",
      "end_date": null,
      "description": []
    }}
  ],
  "education": [
    {{
      "institution": "",
      "degree": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "description": null
    }}
  ],
  "skills": [
    {{
      "category": "",
      "skills": []
    }}
  ],
  "projects": [
    {{
      "name": "",
      "role": null,
      "link": null,
      "description": ""
    }}
  ],
  "certifications": [
    {{
      "name": "",
      "issuer": "",
      "date": ""
    }}
  ],
  "languages": [
    {{
      "name": "",
      "proficiency": ""
    }}
  ],
  "accomplishments": []
}}

RULES FOR ENHANCEMENT:
1. **Personal Info**: Extract name, email, phone, location, and social links. Generate a high-impact "professional_title" based on their core skillset (e.g. "Senior Software Engineer"). Generate a concise, inspiring "power_statement" (a 1-sentence personal elevator pitch).
2. **Professional Summary**: Write a powerful 2-3 sentence professional summary highlighting core expertise, years of experience, and key value delivered.
3. **Experience & Projects (Action & Metrics)**: 
   - Rewrite all bullet points using Google's **XYZ Formula**: "Accomplished [X] as measured by [Y], by doing [Z]" (e.g., "Increased page speed by 40% (Y) by implementing lazy loading and code splitting (Z), resulting in higher user engagement (X)").
   - Start each bullet point with a strong, active verb (e.g., "Pioneered", "Architected", "Spearheaded", "Optimized"). Avoid passive language (e.g., "Responsible for", "Helped with").
   - Include realistic quantified metrics wherever possible (e.g., percentages, dollar amounts, hours saved).
4. **Skills**: Categorize skills into logical groups (e.g. "Languages", "Frameworks & Libraries", "Tools & Cloud Platforms") rather than listing them in a single flat list.
5. **No Hallucinations**: Retain all factual information (companies, dates, degrees). Enhance the phrasing and impact of the achievements, do not invent fictional employers or educational history.
6. **1-Page Constraint (Conciseness)**: The enhanced resume MUST fit onto a single page. Keep descriptions highly concise. Include a maximum of 3 experience entries (prioritize the most recent/relevant) and a maximum of 3 bullet points per entry. List only the most relevant projects and skills.


RAW RESUME TEXT:
{req.resume_text}
"""
    last_error = None

    # Try providers: OpenAI first, then Groq as fallback
    for provider_name, key, get_llm_fn in [
        ("openai", openai_key, lambda k: get_openai_llm(api_key=k, temperature=0.3)),
        ("groq", groq_key, lambda k: get_groq_llm(api_key=k, temperature=0.3)),
    ]:
        if not key:
            continue
        try:
            llm = get_llm_fn(key)
            response = llm.invoke([{"role": "user", "content": prompt}])
            content = clean_json_response(response.content)
            result = json.loads(content)
            return {"resume": result, "provider": provider_name}
        except json.JSONDecodeError:
            last_error = f"Failed to parse response from {provider_name}"
            continue
        except Exception as e:
            last_error = str(e)
            print(f"{provider_name} failed: {e}")
            continue

    raise HTTPException(status_code=429 if "rate limit" in (last_error or "").lower() else 500,
                        detail=last_error or "All AI providers failed")

@app.post("/api/enhance/stream")
async def enhance_resume_stream(req: EnhanceRequest):
    """
    SSE streaming resume enhancement. Tries OpenAI → Groq, retries on failure.
    """
    openai_key = req.openai_api_key or os.environ.get("OPENAI_API_KEY")
    groq_key = req.groq_api_key or os.environ.get("GROQ_API_KEY")

    prompt = f"""You are an expert resume writer. Parse this raw resume text and output ONLY valid JSON matching this structure, no markdown:

{{
  "personal_info": {{"full_name": "", "professional_title": "", "email": "", "phone": "", "location": "", "linkedin": null, "github": null, "website": null, "nationality": null, "hobbies": null, "power_statement": null, "photo_base64": null}},
  "summary": "",
  "experience": [{{"company": "", "position": "", "location": "", "start_date": "", "end_date": null, "description": []}}],
  "education": [{{"institution": "", "degree": "", "location": "", "start_date": "", "end_date": "", "description": null}}],
  "skills": [{{"category": "", "skills": []}}],
  "projects": [{{"name": "", "role": null, "link": null, "description": ""}}],
  "certifications": [{{"name": "", "issuer": "", "date": ""}}],
  "languages": [{{"name": "", "proficiency": ""}}],
  "accomplishments": []
}}

RULES: Extract ALL content. Rewrite bullets using XYZ formula with metrics. Start with strong action verbs. Organize skills into groups. Write a professional 2-4 sentence summary.

RAW RESUME TEXT:
{req.resume_text}
"""

    async def event_stream():
        full_content = ""
        tried_providers = []

        for provider_name, key, get_llm_fn in [
            ("openai", openai_key, lambda: get_openai_llm(api_key=openai_key, temperature=0.3)),
            ("groq", groq_key, lambda: get_groq_llm(api_key=groq_key, temperature=0.3)),
        ]:
            if not key or provider_name in tried_providers:
                continue
            tried_providers.append(provider_name)
            try:
                llm = get_llm_fn()
                for chunk in llm.stream([{"role": "user", "content": prompt}]):
                    if chunk.content:
                        full_content += chunk.content
                        yield f"data: {json.dumps({'token': chunk.content})}\n\n"

                cleaned = clean_json_response(full_content)
                result = json.loads(cleaned)
                yield f"data: {json.dumps({'type': 'complete', 'resume': result})}\n\n"
                yield "data: [DONE]\n\n"
                return
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'detail': f'{provider_name} failed: {str(e)[:100]}, trying next...'})}\n\n"
                full_content = ""

        yield f"data: {json.dumps({'type': 'error', 'detail': 'All AI providers failed'})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.post("/api/parse")
async def parse_resume_file(file: UploadFile = File(...)):
    """
    Parse uploaded resume file (PDF, DOCX, TXT) and extract plain text.
    """
    try:
        contents = await file.read()
        filename = file.filename.lower()
        
        if filename.endswith(".pdf"):
            text = get_pdf_text(contents)
        elif filename.endswith(".docx"):
            text = get_docx_text(contents)
        elif filename.endswith(".txt"):
            try:
                text = contents.decode("utf-8")
            except UnicodeDecodeError:
                text = contents.decode("latin-1")
        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file format. Please upload PDF, DOCX, or TXT."
            )
            
        if not text or text.strip().startswith("Error reading"):
            raise HTTPException(status_code=422, detail=text or "Failed to extract text from file.")
            
        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File parsing failed: {str(e)}")

@app.post("/api/cover-letter/generate")
async def generate_cover_letter(req: CoverLetterRequest):
    """
    Generate an AI cover letter based on sender info, company, job title, and achievements.
    """
    try:
        llm, provider = get_llm(groq_key=req.groq_api_key, openai_key=req.openai_api_key, temperature=0.7)
        
        prompt = f"""You are an expert career coach and professional copywriter. Write a highly tailored, compelling, and professional cover letter for the following job:
- Sender Name: {req.sender_name}
- Sender Professional Title: {req.sender_title}
- Target Company: {req.company_name}
- Target Job Title: {req.job_title}
- Tone: {req.tone}

Key achievements/skills to highlight:
{json.dumps(req.bullet_points or [], indent=2)}

Guidelines:
1. Write a professional letter structure (Date, Salutation, 3-4 body paragraphs, professional Sign-off).
2. The introductory paragraph should express enthusiastic interest and state the target position.
3. The body paragraphs should highlight 1 or 2 high-impact career achievements related to the job title.
4. The closing paragraph should propose a call-to-action (e.g. scheduling an interview).
5. The tone should be {req.tone}.
6. Keep the language natural, modern, and engaging. Avoid boring clichés.
7. Return ONLY the letter body text. No greetings, signatures, or dates at the very top, as the application will render those fields dynamically. Start directly with the salutation (e.g., 'Dear Hiring Manager,' or similar).
"""
        response = llm.invoke([{"role": "user", "content": prompt}])
        return {"letter": response.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8003))
    reload = os.environ.get("ENV", "development") == "development"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)

import os
from typing import List, Dict, Any
from tavily import TavilyClient
from deepagents import create_deep_agent
from schemas import ResumeData
from models import get_groq_llm, get_openai_llm

def tavily_search(query: str) -> str:
    """
    Search the web for information regarding standard resumes, job roles, keywords, or skills.
    Use this to find industry standards, typical job responsibilities, or skills for specific roles.
    """
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return "Tavily API key not found. Cannot perform search."
    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(query, max_results=5)
        results = []
        for result in response.get("results", []):
            results.append(
                f"Title: {result.get('title')}\n"
                f"URL: {result.get('url')}\n"
                f"Snippet: {result.get('content')}\n"
            )
        return "\n---\n".join(results)
    except Exception as e:
        return f"Error performing Tavily search: {str(e)}"

# System prompt for the agent to guide the rewrite
RESUME_AGENT_SYSTEM_PROMPT = """You are an elite, professional Resume Builder AI assistant operating in a Deep Agent framework. Your goal is to construct and refine resumes that score 90%+ on ATS (Applicant Tracking System) scanners and meet the gold standards of resume.io.

CRITICAL: Your output will be scored by an ATS algorithm. To achieve 90%+, you MUST follow these rules precisely.

ATS Scoring Criteria — Follow EVERY rule:
1. **Keywords (30% of score)**:
   - Research the target role using tavily_search to find exact keywords, technologies, and skills.
   - Include ALL critical technical terms and industry buzzwords from the target job description.
   - Achieve 70%+ keyword match rate against the job description.

2. **Content Completeness (20% of score)**:
   - MUST include ALL sections: Professional Summary, Work Experience, Education, Skills, Projects/Certifications.
   - Professional Summary: 2-4 sentence elevator pitch with career stats (years, key skills, top achievement).
   - Work Experience: 3+ roles with 3-5 bullet points each.

3. **Formatting (15% of score)**:
   - EVERY bullet point MUST start with "• " (bullet character).
   - Use clear SECTION HEADERS in ALL CAPS (e.g., "PROFESSIONAL SUMMARY", "EXPERIENCE").
   - Include exact dates for every position (format: "Mon YYYY").
   - Use reverse-chronological order.

4. **Action Verbs (15% of score)** — USE AT LEAST 8 OF THESE across the resume:
   Achieved, Accelerated, Architected, Built, Championed, Created, Delivered, Designed, Developed, Drove, Engineered, Established, Executed, Generated, Grew, Implemented, Improved, Increased, Initiated, Innovated, Integrated, Launched, Led, Managed, Optimized, Orchestrated, Pioneered, Produced, Reduced, Reengineered, Scaled, Simplified, Spearheaded, Streamlined, Transformed, Upgraded
   - NEVER start bullets with "Responsible for", "Helped", "Worked on", "Participated in".

5. **Quantifiable Results (12% of score)** — EVERY BULLET MUST USE THE XYZ FORMULA:
   "Accomplished [X] as measured by [Y] by doing [Z]"
   - Include 4+ percentage metrics (e.g., "increased by 35%", "reduced by 50%").
   - Include 2+ monetary metrics (e.g., "saved $2M", "generated $500K revenue").
   - Include numerical data in every bullet (headcount, time savings, volume processed).

6. **Contact Info (8% of score)**:
   - Must include: email, phone, location.
   - Strongly recommended: LinkedIn URL, GitHub URL, portfolio URL.

OUTPUT REQUIREMENTS:
- All text must be polished, professional, grammatically correct.
- Every bullet must start with a strong action verb and contain at least one number or metric.
- Skills must be organized into logical categorized groups (e.g., "Programming Languages", "Cloud & DevOps").
- Do NOT write placeholder text or generic content — every word must add value.

You have access to the `tavily_search` tool. Use it to research target roles for exact keywords, current industry standards, and competitor resume examples.

Your output MUST fit the ResumeData schema perfectly.
"""

def _parse_agent_response(response: Dict[str, Any]) -> ResumeData:
    """Helper to extract structured ResumeData from the deepagent response state."""
    # Try to extract the structured response from the graph state first (highest priority)
    parsed_data = response.get("structured_response")
    if parsed_data:
        if isinstance(parsed_data, ResumeData):
            return parsed_data
        if isinstance(parsed_data, dict):
            try:
                return ResumeData(**parsed_data)
            except Exception as e:
                print(f"Error parsing structured_response dict: {e}")

    # Fallback: Extract from the conversation messages if structured_response is missing
    messages = response.get("messages", [])
    if not messages:
        raise ValueError("Agent did not return any messages and no structured_response was found.")
        
    last_message = messages[-1]
    
    # Case 1: If it's on the tool_calls of the last message
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        for tc in last_message.tool_calls:
            args = tc.get("args")
            if args:
                try:
                    return ResumeData(**args)
                except:
                    pass
                
    # Case 2: In additional_kwargs
    if hasattr(last_message, "additional_kwargs"):
        tool_calls = last_message.additional_kwargs.get("tool_calls", [])
        for tc in tool_calls:
            function_info = tc.get("function", {})
            arguments = function_info.get("arguments", "{}")
            import json
            try:
                args = json.loads(arguments)
                return ResumeData(**args)
            except:
                pass
                
    # Case 3: In content (if LLM returned it as a JSON string)
    if last_message.content:
        content = last_message.content.strip()
        # Clean markdown wrappers if any
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        import json
        try:
            parsed_json = json.loads(content)
            return ResumeData(**parsed_json)
        except Exception as e:
            print(f"Error parsing json from message content: {e}")
            
    # If all parses fail, but we have some dict, try to convert it
    if isinstance(parsed_data, dict):
        return ResumeData.model_validate(parsed_data)
        
    raise ValueError(f"Agent failed to return structured ResumeData. Raw content: {last_message.content}")

def refine_resume_with_agent(
    current_resume_dict: Dict[str, Any],
    refinement_instructions: str,
    groq_api_key: str = None,
    openai_api_key: str = None,
    tavily_api_key: str = None,
) -> ResumeData:
    """
    Runs the deep agent with the current resume data and user refinement instructions.
    Uses Tavily to search for role-specific information.
    Attempts Groq (Llama-3.3-70b) first, and falls back to OpenAI (GPT-4o-mini) if it fails.
    """
    # Temporarily set the Tavily key if passed in
    if tavily_api_key:
        os.environ["TAVILY_API_KEY"] = tavily_api_key
        
    # Construct the input prompt for the agent
    user_prompt = f"""Here is the candidate's resume data in JSON format:
{current_resume_dict}

IMPORTANT: If the "summary" field contains a large block of raw resume text (more than 200 characters), the other sections (experience, education, skills, etc.) may be empty. In that case, you MUST:
1. Parse the raw text in the "summary" field carefully.
2. Extract ALL content from it — personal details, work history, education, skills, projects, certifications, languages, accomplishments.
3. Populate every section of the ResumeData with the extracted information.
4. Then apply all the refinements below.

Refinement Instructions/Goals from user:
"{refinement_instructions}"

Please review and refine the resume.
1. Perform web searches if needed to verify standard responsibilities, skills, and industry terms for their target role or companies.
2. Rewrite the professional summary to make it highly engaging and professional (2-4 sentences).
3. Optimize the work experience bullet points. Rewrite them to start with strong action verbs, focus on achievements, and include metrics (if possible or logically inferred). Use the XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].
4. Organize skills into logical groups (e.g., "Programming Languages", "Cloud & DevOps", "Frameworks").
5. Refine education, projects, certifications, and languages.
6. Ensure contact info includes email, phone, LinkedIn, and GitHub at minimum.
7. Return the COMPLETE updated resume data matching the structured ResumeData format — do NOT leave sections empty if you can extract data from the raw text.

CRITICAL DIRECTIVE: Do NOT use the write_file, edit_file, or any other file system tools. Do NOT use any todo lists. You MUST immediately execute your final tool call returning the structured ResumeData object. Do not perform any intermediate draft writing tool calls.
"""


    groq_key = groq_api_key or os.environ.get("GROQ_API_KEY")
    openai_key = openai_api_key or os.environ.get("OPENAI_API_KEY")
    
    last_error = None
    
    # 1. Try OpenAI (GPT-4o — Primary)
    if openai_key:
        try:
            print("Attempting resume refinement with OpenAI (GPT-4o-mini)...")
            llm = get_openai_llm(api_key=openai_key, temperature=0.3)
            
            # Initialize the deep agent using the deepagents framework
            agent = create_deep_agent(
                model=llm,
                tools=[tavily_search],
                system_prompt=RESUME_AGENT_SYSTEM_PROMPT,
                response_format=ResumeData,
                debug=False
            )

            
            # Run the agent
            response = agent.invoke({"messages": [{"role": "user", "content": user_prompt}]})
            return _parse_agent_response(response)
        except Exception as e:
            print(f"Primary OpenAI execution failed: {e}")
            last_error = e
            
    # 2. Try Groq (Fallback)
    if groq_key:
        try:
            print("Attempting resume refinement with Groq fallback (Llama-3.3-70b)...")
            llm = get_groq_llm(api_key=groq_key, temperature=0.3)
            
            # Initialize the deep agent using the deepagents framework
            agent = create_deep_agent(
                model=llm,
                tools=[tavily_search],
                system_prompt=RESUME_AGENT_SYSTEM_PROMPT,
                response_format=ResumeData,
                debug=False
            )

            
            # Run the agent
            response = agent.invoke({"messages": [{"role": "user", "content": user_prompt}]})
            return _parse_agent_response(response)
        except Exception as e:
            print(f"Fallback OpenAI execution failed: {e}")
            last_error = e
            
    # Raise error if everything failed
    if last_error:
        raise last_error
    else:
        raise ValueError("No API keys provided. Please configure a Groq or OpenAI key.")


def generate_resume_suggestions(
    resume_dict: Dict[str, Any],
    groq_api_key: str = None,
    openai_api_key: str = None
) -> List[Dict[str, Any]]:
    """
    Analyzes the resume data and generates 3-5 specific, actionable suggestions.
    Each suggestion has structure:
    {
      "title": str,
      "reason": str,
      "section": str,
      "index": int/None,
      "key": str/None,
      "bullet_index": int/None,
      "original": str,
      "suggested": str or List[str]
    }
    """
    import json
    
    SUGGESTIONS_SYSTEM_PROMPT = """You are an expert resume reviewer and builder. Your job is to analyze the user's resume and generate 3 to 5 highly specific, actionable suggestions to improve the resume.
Each suggestion must target a specific field in the resume (e.g. summary, power_statement under personal_info, accomplishments, a specific experience description bullet point, a skill category, etc.) and provide:
1. A clear title.
2. A detailed reason explaining why the change is beneficial (e.g. "Adds a metrics-based result using the XYZ formula", "Fixes vagueness", "Better highlights leadership", "Aligns with industry-standard terms").
3. The original content.
4. The suggested enhanced content.
5. The structural update path so that the application can automatically apply this suggestion.

You MUST return a JSON array of objects. Do not wrap the JSON in ```json or any other text. Return ONLY raw JSON matching this schema:
[
  {
    "title": "Short title",
    "reason": "Why this suggestion improves the resume",
    "section": "personal_info" | "summary" | "experience" | "skills" | "accomplishments" | "projects" | "certifications" | "languages",
    "index": null, // (integer 0-based index if section is experience, skills, projects, certifications, languages, accomplishments)
    "key": null, // (string field key to update, e.g. "power_statement" or "professional_title" for personal_info; "description" or "position" or "company" for experience; "category" or "skills" for skills)
    "bullet_index": null, // (integer 0-based index if updating a specific bullet point in an experience description list)
    "original": "The original text being replaced",
    "suggested": "The new suggested text" // (must be a string, or a list of strings if replacing a whole bullet list)
  }
]
"""

    groq_key = groq_api_key or os.environ.get("GROQ_API_KEY")
    openai_key = openai_api_key or os.environ.get("OPENAI_API_KEY")
    
    llm = None
    if openai_key:
        try:
            llm = get_openai_llm(openai_key, temperature=0.2)
        except Exception as e:
            print(f"Failed to load OpenAI for suggestions: {e}")
            
    if not llm and groq_key:
        try:
            llm = get_groq_llm(groq_key, temperature=0.2)
        except Exception as e:
            print(f"Failed to load Groq fallback for suggestions: {e}")
            
    if not llm:
        raise ValueError("No LLM API keys configured. Please configure Groq or OpenAI in the sidebar.")
        
    messages = [
        {"role": "system", "content": SUGGESTIONS_SYSTEM_PROMPT},
        {"role": "user", "content": f"Here is the current resume data in JSON format:\n{json.dumps(resume_dict, indent=2)}"}
    ]
    
    response = llm.invoke(messages)
    content = response.content.strip()
    
    # Clean markdown formatting if present
    if content.startswith("```json"):
        content = content[7:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    
    try:
        suggestions = json.loads(content)
        if isinstance(suggestions, list):
            return suggestions
        elif isinstance(suggestions, dict) and "suggestions" in suggestions:
            return suggestions["suggestions"]
        else:
            raise ValueError("Suggestions response is not a list or dictionary containing suggestions.")
    except Exception as e:
        print(f"JSON parsing error: {e}. Raw content: {content}")
        raise ValueError(f"Failed to parse suggestions as JSON: {str(e)}")


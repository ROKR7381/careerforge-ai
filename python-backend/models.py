import os
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from typing import Optional

def get_openai_llm(api_key: str = None, temperature: float = 0.3, model: str = "gpt-4o-mini"):
    """Returns a ChatOpenAI instance using GPT-4o-mini (cheap + high quality)."""
    key = api_key or os.environ.get("OPENAI_API_KEY")
    if not key:
        raise ValueError("OpenAI API Key is missing.")
    return ChatOpenAI(
        openai_api_key=key,
        model_name=model,
        temperature=temperature,
        timeout=120  # seconds — prevents indefinite hang
    )

def get_groq_llm(api_key: str = None, temperature: float = 0.3):
    """Returns a ChatGroq instance (secondary fallback)."""
    key = api_key or os.environ.get("GROQ_API_KEY")
    if not key:
        raise ValueError("Groq API Key is missing.")
    return ChatGroq(
        groq_api_key=key,
        model_name="llama-3.3-70b-versatile",
        temperature=temperature,
        timeout=120  # seconds — prevents indefinite hang
    )

def get_llm(openai_key: Optional[str] = None, groq_key: Optional[str] = None, temperature: float = 0.3):
    """
    Returns an LLM instance. Tries OpenAI (GPT-4o-mini) first, falls back to Groq.
    Returns (llm_instance, provider_name).
    """
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
        except:
            pass

    raise ValueError("No API keys configured. Please set OPENAI_API_KEY or GROQ_API_KEY.")

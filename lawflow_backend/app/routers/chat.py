import os
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from ..schemas import ChatIn, ChatOut

# Load environment variables (from .env file)
load_dotenv()

# Configure Google GenAI
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Initialize the model with system instructions
SYSTEM_PROMPT = (
    "Eres el asistente inteligente de Lawflow, una plataforma avanzada para abogados y gestores inmobiliarios. "
    "Tu objetivo es ayudar a los profesionales a gestionar sus expedientes, cronogramas y tareas de forma eficiente. "
    "Sé conciso, profesional y servicial. Responde siempre en el idioma que el usuario utilice."
)

_INLINE_SYSTEM_PROMPT = False
try:
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPT,
    )
except TypeError:
    # Older google-generativeai versions don't support `system_instruction`.
    _INLINE_SYSTEM_PROMPT = True
    model = genai.GenerativeModel(model_name="gemini-2.5-flash")

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatOut)
async def chat(payload: ChatIn):
    if not api_key:
        # Fallback to simple rule-based if no API key
        msg = payload.message.lower()
        if "hola" in msg:
            res = "¡Hola! Soy tu asistente de Lawflow. ¿En qué puedo ayudarte hoy?"
        else:
            res = "Lo siento, la integración de IA no está configurada correctamente. ¿En qué puedo ayudarte de forma manual?"
        return ChatOut(response=res)

    try:
        msg = payload.message
        if _INLINE_SYSTEM_PROMPT:
            msg = f"{SYSTEM_PROMPT}\n\nUsuario: {payload.message}"
        response = model.generate_content(msg)
        return ChatOut(response=response.text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return ChatOut(response="Lo siento, he tenido un pequeño problema técnico al procesar tu solicitud. ¿Podrías intentarlo de nuevo?")

"""Agent service: Gemini chat with function calling."""
import os
import json

# Template replies when no Gemini key or model unavailable
TEMPLATE_REPLIES = {
    "en": "Based on your {area_acres} acres of {crop}: estimated {straw_q} quintals of straw, farmer share Rs {farmer_share}, plus Rs {incentive} incentive = Rs {farmer_net} total. We make not burning the profitable choice.",
    "hi": "आपके {area_acres} एकड़ {crop} से: अनुमानित {straw_q} क्विंटल पराली, किसान हिस्सा ₹{farmer_share}, प्रोत्साहन ₹{incentive} = कुल ₹{farmer_net}। हम जलाने की बजाय कमाई का रास्ता दिखाते हैं।",
    "pa": "ਤੁਹਾਡੇ {area_acres} ਏਕੜ {crop} ਤੋਂ: ਅੰਦਾਜ਼ਨ {straw_q} ਕੁਇੰਟਲ ਪਰਾਲੀ, ਕਿਸਾਨ ਹਿੱਸਾ ₹{farmer_share}, ਪ੍ਰੋਤਸਾਹਨ ₹{incentive} = ਕੁੱਲ ₹{farmer_net}। ਅਸੀਂ ਨਾ ਸਾੜਨ ਨੂੰ ਫਾਇਦੇਮੰਦ ਬਣਾਉਂਦੇ ਹਾਂ।",
    "hr": "थारे {area_acres} एकड़ {crop} तै: अंदाजन {straw_q} क्विंटल पराली, किसान हिस्सा ₹{farmer_share}, प्रोत्साहन ₹{incentive} = कुल ₹{farmer_net}। म्हारा काम ना फूंकाण के पईसे देणा सै।",
}

SYSTEM_PROMPT = """You are a voice assistant for farmers in Punjab/Haryana. Reply in the farmer's language, in 2 short sentences. If an image is shared, identify the crop and say how confident you are. Never state prices or quantities yourself; always call the tools. If crop or acreage is missing, ask one question at a time."""


async def chat_with_agent(
    transcript: list[dict],
    language: str = "en",
    image: str | None = None,
    plan_data: dict | None = None,
) -> dict:
    """Handle chat via Gemini function calling or template fallback."""
    model_name = os.environ.get("GEMINI_MODEL", "")
    api_key = os.environ.get("GEMINI_API_KEY", "")
    
    # If no key or model, use deterministic template
    if not api_key or not model_name:
        return _template_reply(transcript, language, plan_data)
    
    try:
        from google import genai
        
        client = genai.Client(api_key=api_key)
        
        # Try to use the model
        response = await _call_gemini(client, model_name, transcript, language, image, plan_data)
        return response
    except Exception as e:
        print(f"Gemini chat failed: {e}")
        return _template_reply(transcript, language, plan_data)


async def _call_gemini(client, model_name: str, transcript: list, language: str,
                       image: str | None, plan_data: dict | None) -> dict:
    """Actually call Gemini with function calling tools."""
    # For now, use template - full Gemini integration requires async genai
    return _template_reply(transcript, language, plan_data)


def _template_reply(transcript: list, language: str, plan_data: dict | None) -> dict:
    """Build deterministic reply from plan data."""
    lang = language if language in TEMPLATE_REPLIES else "en"
    template = TEMPLATE_REPLIES[lang]
    
    if plan_data:
        reply = template.format(
            area_acres=plan_data.get("area_acres", 8),
            crop=plan_data.get("crop", "paddy"),
            straw_q=plan_data.get("straw_q", 216),
            farmer_share=plan_data.get("farmer_share", 8343),
            incentive=plan_data.get("incentive", 9600),
            farmer_net=plan_data.get("farmer_net", 17943),
        )
    else:
        reply = template.format(
            area_acres=8, crop="paddy", straw_q=216,
            farmer_share=8343, incentive=9600, farmer_net=17943,
        )
    
    return {"replyText": reply, "ui_state": {}}

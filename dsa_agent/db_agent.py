from llm import llm
from firebase_config import db
import json
import re

from llm import llm
from firebase_config import db
import json
import re

def inserter(review_list):
    print('----------------------------------------------------------------------------------------')
    print("INSERTING REVIEW LIST:", review_list)

    prompt = f"""
    Convert the following evaluation list into a JSON ARRAY.
    
    For EACH entry, output only the following fields:
    - weekNo (integer, default 0 if missing)
    - email (string)
    - q1_score (integer)
    - q2_score (integer)
    - q3_score (integer)
    - total_score (integer)

    ALWAYS output a JSON ARRAY like this:
    [
      {{ "weekNo": 1, "email": "...", "q1_score": 1, "q2_score": 1, "q3_score": 5, "total_score": 7 }},
      ...
    ]

    Do NOT wrap in ```json fences or any markdown.

    Here is the data:
    {review_list}
    """

    # Call LLM
    llm_resp = llm.invoke(prompt)
    raw = llm_resp.content.strip()
    print("RAW LLM RESPONSE:", repr(raw))

    # Remove code block wrappers
    cleaned = raw.replace("```json", "").replace("```", "").strip()

    # Extract valid JSON array using regex
    match = re.search(r"\[\s*{.*}\s*\]", cleaned, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find JSON array in output: {cleaned}")

    json_text = match.group()
    print("JSON ARRAY EXTRACTED:", json_text)

    # Parse JSON list
    data_list = json.loads(json_text)
    print("PARSED LIST:", data_list)

    # Insert each user into Firestore
    doc_id ="week_0"   # or "week1", or dynamic

    db.collection("leaderboard").document(doc_id).set({
        "users": data_list
    })

    print("Inserted leaderboard array into document:", doc_id)




    print('----------------------------------------------------------------------------------------')

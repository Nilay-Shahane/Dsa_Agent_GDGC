from flask import Flask, request, jsonify
from llm import llm
import json
from db_agent import inserter
from firebase_config import db

app = Flask(__name__)
@app.route("/")
def home():
    return "Firestore Connected Successfully!"


# Load prompt text once
with open("prompt.txt", "r", encoding="utf-8") as f:
    prompt_text = f.read()


def reviewer(user_data):
    """
    Takes a single user submission and sends it to the LLM for review.
    Returns the parsed JSON response.
    """
    prompt = f"{prompt_text}\n\nUser submission:\n{json.dumps(user_data, indent=2)}"
    llm_resp = llm.invoke(prompt)
    
    print("LLM Response:", llm_resp)
    print("Type:", type(llm_resp))
    
    # Extract content from AIMessage
    if hasattr(llm_resp, "content"):
        content = llm_resp.content
    else:
        content = str(llm_resp)
    
    # Clean and parse JSON response
    try:
        # Remove markdown code blocks if present
        cleaned = content.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)
        
        # If it's a list with one item, extract that item
        if isinstance(parsed, list) and len(parsed) == 1:
            return parsed[0]
        
        return parsed
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"Content was: {content}")
        # Return the raw content if JSON parsing fails
        return content


@app.route("/review", methods=["POST"])
def review_endpoint():
    try:
        user_data = request.get_json()
        
        if not user_data or not isinstance(user_data, list):
            return jsonify({"error": "Invalid or empty JSON data. Must be an array."}), 400

        print(f"Received {len(user_data)} users for review")
        
        # Process all users
        review_list = []
        for i, user in enumerate(user_data):
            print(f"Processing user {i+1}/{len(user_data)}: {user.get('email', 'no email')}")
            
            # Pass single user as list (as expected by your prompt)
            review_result = reviewer([user])
            review_list.append(review_result)
        
        print(f"Successfully generated {len(review_list)} reviews")
        
        # Insert all reviews AFTER processing all users
        try:
            inserter(review_list)
            print("Successfully inserted reviews into database")
        except Exception as db_error:
            print(f"Database insertion error: {db_error}")
            # Continue even if DB insert fails
        
        return jsonify({"reviews": review_list}), 200

    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
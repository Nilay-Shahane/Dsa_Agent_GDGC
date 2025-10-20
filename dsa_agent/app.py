from flask import Flask, request, jsonify
from llm import llm
import json

app = Flask(__name__)

# Load prompt text once
with open("prompt.txt", "r", encoding="utf-8") as f:
    prompt_text = f.read()


def reviewer(user_data):
    """
    Takes a list of user submissions and sends it to the LLM for review.
    Converts AIMessage to string to be JSON serializable.
    """
    prompt = f"{prompt_text}\n\nUser submission:\n{json.dumps(user_data, indent=2)}"
    llm_resp = llm.invoke(prompt)
    
    
    print("LLM Response:", llm_resp)
    print("Type:", type(llm_resp))
    
    
    if hasattr(llm_resp, "content"):
        return llm_resp.content
    else:
        return str(llm_resp)


@app.route("/review", methods=["POST"])
def review_endpoint():
    try:
        user_data = request.get_json()
        
        
        if not user_data or not isinstance(user_data, list):
            return jsonify({"error": "Invalid or empty JSON data. Must be an array."}), 400

        print(f"Received {len(user_data)} users for review")
        
        
        review_list = []
        for i, user in enumerate(user_data):
            print(f"Processing user {i+1}/{len(user_data)}: {user.get('email', 'no email')}")
            review_text = reviewer([user])
            review_list.append(review_text)

        print(f"Successfully generated {len(review_list)} reviews")
        return jsonify({"reviews": review_list}), 200

    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
import os
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

try:
    from huggingface_hub import InferenceClient
except Exception:
    InferenceClient = None

client = None

if InferenceClient is not None and api_token:
    try:
        print("Initializing HuggingFace Inference Client...")
        client = InferenceClient(api_key=api_token)
    except Exception as e:
        print(f"Failed to initialize: {e}")
        client = None

print("System: Chatbot initialized.")

system_msg = {"role": "system", "content": "Health information chatbot"}
history = [system_msg]

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit", "q"]:
        print("Goodbye!")
        break
    if not user_input.strip():
        continue
    try:
        if client:
            history.append({"role": "user", "content": user_input})
            response = client.chat_completion(
                model="meta-llama/Meta-Llama-3-8B-Instruct",
                messages=history,
                max_tokens=512,
                temperature=0.7
            )
            bot_response = response.choices[0].message.content.strip()
            print(f"\nBot: {bot_response}\n")
            history.append({"role": "assistant", "content": bot_response})
        else:
            print("Client not initialized")
            break
    except Exception as e:
        print(f"Error: {e}")

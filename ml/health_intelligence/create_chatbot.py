with open('chatbot.py', 'w') as f:
    f.write("""import os
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

try:
    from huggingface_hub import InferenceClient
except:
    InferenceClient = None

client = None
if InferenceClient and api_token:
    try:
        print("Initializing HuggingFace Inference Client...")
        client = InferenceClient(api_key=api_token)
    except Exception as e:
        print(f"Failed: {e}")
        client = None
else:
    if not api_token:
        print("Error: Missing HUGGINGFACEHUB_API_TOKEN")

print("System: Chatbot initialized. Type exit to quit.")

system_message = {"role": "system", "content": "You are a health chatbot"}
chat_history = [system_message]

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit", "q"]:
        print("Chatbot: Stay healthy!")
        break
    if not user_input.strip():
        continue
    try:
        if client:
            chat_history.append({"role": "user", "content": user_input})
            response = client.chat_completion(model="meta-llama/Meta-Llama-3-8B-Instruct", messages=chat_history, max_tokens=512, temperature=0.7)
            bot_text = response.choices[0].message.content.strip()
            print(f"\\nBot: {bot_text}\\n")
            chat_history.append({"role": "assistant", "content": bot_text})
        else:
            break
    except Exception as e:
        print(f"Error: {e}")
""")
print("chatbot.py created")

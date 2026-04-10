import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct"

load_dotenv(dotenv_path=ENV_PATH)


def get_api_token():
    for env_name in ("HUGGINGFACEHUB_API_TOKEN", "HF_TOKEN", "HUGGINGFACE_API_TOKEN"):
        value = os.getenv(env_name)
        if value:
            return value.strip().strip("\"'"), env_name
    return None, None


def build_client(api_token):
    try:
        from huggingface_hub import InferenceClient
    except Exception as exc:
        return None, f"Could not import huggingface_hub.InferenceClient: {exc}"

    print("Initializing HuggingFace Inference Client...")

    try:
        return InferenceClient(api_key=api_token), None
    except TypeError:
        try:
            return InferenceClient(token=api_token), None
        except Exception as exc:
            return None, f"Failed to initialize Hugging Face client: {exc}"
    except Exception as exc:
        return None, f"Failed to initialize Hugging Face client: {exc}"


def request_chat_completion(client, messages):
    request_args = {
        "model": MODEL_ID,
        "messages": messages,
        "max_tokens": 512,
        "temperature": 0.7,
    }

    if hasattr(client, "chat_completion"):
        return client.chat_completion(**request_args)

    return client.chat.completions.create(**request_args)


api_token, token_env_name = get_api_token()

if not api_token:
    print(
        "Startup error: Missing Hugging Face token. "
        f"Set HUGGINGFACEHUB_API_TOKEN or HF_TOKEN in {ENV_PATH}."
    )
    raise SystemExit(1)

client, init_error = build_client(api_token)

if client is None:
    print(f"Startup error: {init_error}")
    raise SystemExit(1)

print(f"System: Chatbot initialized. Using {token_env_name}.")

system_msg = {"role": "system", "content": "Health information chatbot"}
history = [system_msg]

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit", "q"]:
        print("Goodbye!")
        break
    if not user_input.strip():
        continue

    history.append({"role": "user", "content": user_input})

    try:
        response = request_chat_completion(client, history)
        bot_response = response.choices[0].message.content.strip()
        print(f"\nBot: {bot_response}\n")
        history.append({"role": "assistant", "content": bot_response})
    except Exception as exc:
        history.pop()
        print(f"Error: {exc}")

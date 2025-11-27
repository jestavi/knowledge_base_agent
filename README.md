
# Knowledge Base Agent

This repository contains everything you need to run your **Knowledge Base Agent** locally.

---

## Run Locally

**Prerequisites:** Node.js (v18+) installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/jestavi/knowledge_base_agent.git
cd knowledge_base_agent

2. Install Dependencies
bash
Copy code
npm install

3. Set Environment Variables
Create a .env.local file in the root folder and add your API keys:

env
Copy code
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
Replace the keys with your actual API keys.

4. Run the App
bash
Copy code
npm run dev

#  DSA Agent & Mailer

This repository contains two interconnected modules — **DSA Agent** and **Mailer** — designed for automating email communication and integrating AI-powered code review or learning features.


##  Features

###  DSA Agent
- Provides **intelligent assistance** for DSA (Data Structures & Algorithms) problems.
- Can **analyze**, **review**, and **suggest improvements** for submitted solutions.
- Easily extendable to support code review automation or chatbot integration.

###  Mailer
- Built using **Node.js** and **Nodemailer**.
- Sends automatic emails (notifications, updates, etc.) to users.
- Configurable through environment variables for SMTP credentials.

---

##  Tech Stack

| Component | Technology |
|------------|-------------|
| Backend | Flask (Python) / Node.js |
| Email Service | Nodemailer |
| AI Logic |Gemini 2.5 flash|
| Database |Firebase (optional) |

---

## Setup Instructions


```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

cd mailer
npm install express cors dotenv axios nodemailer
# or for DSA Agent
cd ../dsa_agent
pip install -r requirements.txt
```

## For mailer/.env
  PASSWORD = xxxx xxxx xxxx xxxx
## For dsa_agent/.env
  GOOGLE_API_KEY=xxx


### For Contributing
# Fork the repo
# Create a new branch (feature/new-feature)
# Commit changes
# Push and open a Pull Request

---
## Author

Nilay Shahane
📧 nilayshahane@gmail.com

const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config()
const app = express();
app.use(express.json());

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dbitgdgcdsa@gmail.com',
    pass: process.env.PASSWORD
  }
});

function formatReviewHTML(reviewData) {
  try {
    let parsed;
    if (typeof reviewData === 'string') {
      const cleaned = reviewData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
      parsed = Array.isArray(parsed) ? parsed[0] : parsed;
    } else {
      parsed = reviewData;
    }

    // Helper function to determine score class
    function getScoreClass(scoreStr) {
      const score = parseFloat(scoreStr.split('/')[0]);
      if (score >= 8) return 'score-excellent';
      if (score >= 5) return 'score-good';
      return 'score-needs-improvement';
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #2c3e50; 
      background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
      padding: 40px 20px;
    }
    .email-wrapper { 
      max-width: 680px; 
      margin: 0 auto; 
    }
    .container { 
      background: #ffffff; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .header { 
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white; 
      padding: 40px 30px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    .header-content { position: relative; z-index: 1; }
    .header h1 { 
      margin: 0 0 12px 0; 
      font-size: 32px; 
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p { 
      margin: 0; 
      opacity: 0.95; 
      font-size: 15px;
      font-weight: 500;
    }
    .header .question-label {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .content { padding: 40px 30px; }
    .section { 
      margin-bottom: 35px;
      animation: fadeIn 0.6s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .section h2 { 
      color: #1a1a2e;
      margin: 0 0 16px 0; 
      font-size: 20px; 
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section h2::before {
      content: '';
      width: 4px;
      height: 24px;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      border-radius: 2px;
    }
    .code-block { 
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 10px;
      overflow-x: auto;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      border: 1px solid #333;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .score-container {
      background: #ffffff;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      border: 2px solid #e9ecef;
    }
    .score-excellent .score {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .score-good .score {
      background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .score-needs-improvement .score {
      background: linear-gradient(135deg, #f85032 0%, #e73827 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .score { 
      font-size: 20px;
      font-weight: 900;
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      font-family: monospace;
      letter-spacing: 2px;
    }
    .score-label {
      font-size: 13px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 3px;
      font-weight: 700;
      margin-top: 12px;
    }
    .badge { 
      display: inline-block;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .badge-correct { 
      background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%);
color: #ffffff;
box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);



    }
    .badge-incorrect { 
      background: linear-gradient(135deg, #f85032 0%, #e73827 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(248, 80, 50, 0.4);
    }
    .review-text {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #2a5298;
      color: #2c3e50;
      line-height: 1.8;
      font-size: 15px;
    }
    .footer { 
      text-align: center;
      padding: 35px 30px;
      background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
      border-top: 1px solid #dee2e6;
    }
    .footer p { 
      color: #6c757d;
      font-size: 14px;
      margin: 8px 0;
    }
    .footer strong {
      color: #495057;
      font-size: 16px;
      display: block;
      margin-bottom: 8px;
    }
    .footer .emoji {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    /* Mobile Responsive Styles */
    @media only screen and (max-width: 600px) {
      body {
        padding: 20px 10px;
      }
      
      .email-wrapper {
        max-width: 100%;
      }
      
      .container {
        border-radius: 12px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 24px;
        margin-bottom: 10px;
      }
      
      .header p {
        font-size: 14px;
      }
      
      .header .question-label {
        font-size: 11px;
        padding: 3px 10px;
      }
      
      .header::before {
        width: 300px;
        height: 300px;
        top: -40%;
        right: -30%;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .section {
        margin-bottom: 25px;
      }
      
      .section h2 {
        font-size: 18px;
        margin-bottom: 12px;
      }
      
      .section h2::before {
        width: 3px;
        height: 20px;
      }
      
      .code-block {
        padding: 15px;
        font-size: 12px;
        line-height: 1.5;
      }
      
      .score-container {
        padding: 25px 20px;
        margin: 20px 0;
      }
      
      .score {
        font-size: 16px;
        padding: 6px 10px;
        letter-spacing: 1px;
      }
      
      .score-label {
        font-size: 11px;
        letter-spacing: 2px;
        margin-top: 10px;
      }
      
      .badge {
        padding: 8px 16px;
        font-size: 12px;
      }
      
      .review-text {
        padding: 15px;
        font-size: 14px;
        line-height: 1.7;
      }
      
      .footer {
        padding: 25px 20px;
      }
      
      .footer .emoji {
        font-size: 20px;
        margin-bottom: 8px;
      }
      
      .footer strong {
        font-size: 15px;
      }
      
      .footer p {
        font-size: 13px;
      }
    }
    
    @media only screen and (max-width: 400px) {
      body {
        padding: 15px 5px;
      }
      
      .header {
        padding: 25px 15px;
      }
      
      .header h1 {
        font-size: 20px;
      }
      
      .content {
        padding: 25px 15px;
      }
      
      .section h2 {
        font-size: 16px;
      }
      
      .code-block {
        font-size: 11px;
        padding: 12px;
      }
      
      .score {
        font-size: 14px;
      }
      
      .review-text {
        font-size: 13px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="header-content">
          <div class="question-label">Code Review</div>
          <h1>Review Complete ✓</h1>
          <p><strong>Question:</strong> ${parsed.question}</p>
        </div>
      </div>

      <div class="content">
        <div class="section">
          <h2>Correctness</h2>
          <span class="badge ${parsed.cor.toLowerCase().includes('correct') ? 'badge-correct' : 'badge-incorrect'}">
            ${parsed.cor}
          </span>
        </div>

        <div class="section">
          <h2>Your Solution</h2>
          <div class="code-block">${escapeHtml(parsed.answer)}</div>
        </div>

        <div class="section">
          <h2>Code Review</h2>
          <div class="review-text">${parsed.code_review}</div>
        </div>

        <div class="section">
          <h2>Test Cases</h2>
          <div class="review-text">${parsed.test_cases}</div>
        </div>

        <div class="section">
          <h2>Explanation Review</h2>
          <div class="review-text">${parsed.explanation_review}</div>
        </div>

        <div class="score-container ${getScoreClass(parsed.score)}">
          <div class="score">${parsed.score}</div>
          <div class="score-label">Final Score</div>
        </div>
      </div>

      <div class="footer">
        <div class="emoji">💻</div>
        <strong>Keep coding and improving!</strong>
        <p>Every review is a step toward mastery</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  } catch (error) {
    console.error('Error formatting review:', error);
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Code Review</h2>
  <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">${escapeHtml(String(reviewData))}</pre>
</body>
</html>
    `;
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}


app.post('/review', async (req, res) => {
  const userData = req.body;

  if (!userData || !Array.isArray(userData)) {
    return res.status(400).json({ error: 'Invalid or empty JSON data. Must be an array.' });
  }

  console.log(`📥 Received ${userData.length} submissions`);

  try {

    const flaskResponse = await axios.post('http://127.0.0.1:5000/review', userData);
    const reviews = flaskResponse.data.reviews;

    console.log(`✅ Received ${reviews.length} reviews from Flask`);

    
    const emailPromises = userData.map((user, idx) => {
      const reviewText = reviews[idx];
      const htmlContent = formatReviewHTML(reviewText);

      const mailOptions = {
        from: 'dbitgdgcdsa@gmail.com',
        to: user.email,
        subject: `✅ Code Review: ${user.question}`,
        html: htmlContent
      };

      return transporter.sendMail(mailOptions)
        .then(info => {
          console.log(`✅ Email sent to ${user.email}`);
          return { email: user.email, status: 'sent', info: info.response };
        })
        .catch(err => {
          console.error(`❌ Failed to send email to ${user.email}:`, err.message);
          return { email: user.email, status: 'failed', error: err.message };
        });
    });

    
    const emailResults = await Promise.all(emailPromises);

   
    res.status(200).json({
      message: 'Reviews completed and emails sent',
      emailResults: emailResults
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
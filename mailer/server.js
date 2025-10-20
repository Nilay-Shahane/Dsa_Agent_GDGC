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

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #667eea; margin-top: 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .code-block { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; }
    .score { font-size: 32px; font-weight: bold; color: #28a745; text-align: center; padding: 20px; background: #e8f5e9; border-radius: 10px; margin: 20px 0; }
    .badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .badge-correct { background: #d4edda; color: #155724; }
    .badge-incorrect { background: #f8d7da; color: #721c24; }
    .footer { text-align: center; padding: 30px; background: #f8f9fa; color: #666; }
    p { margin: 10px 0; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Code Review Results</h1>
      <p><strong>Question:</strong> ${parsed.question}</p>
    </div>

    <div class="content">
      <div class="section">
        <h2>✅ Correctness</h2>
        <span class="badge ${parsed.cor.toLowerCase().includes('correct') ? 'badge-correct' : 'badge-incorrect'}">
          ${parsed.cor}
        </span>
      </div>

      <div class="section">
        <h2>📝 Your Solution</h2>
        <div class="code-block">${escapeHtml(parsed.answer)}</div>
      </div>

      <div class="section">
        <h2>🔍 Code Review</h2>
        <p>${parsed.code_review}</p>
      </div>

      <div class="section">
        <h2>🧪 Test Cases</h2>
        <p>${parsed.test_cases}</p>
      </div>

      <div class="section">
        <h2>💡 Explanation Review</h2>
        <p>${parsed.explanation_review}</p>
      </div>

      <div class="score">
        📊 Final Score: ${parsed.score}
      </div>
    </div>

    <div class="footer">
      <p><strong>Keep coding!</strong> 🚀</p>
      <p style="font-size: 12px; color: #999;">Automated Code Review System</p>
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
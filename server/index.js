const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, mode } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scan', async (req, res) => {
  const { contractText } = req.body;
  if (!contractText) return res.status(400).json({ error: 'No contract text provided' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this contract for red flags: ${contractText}. Return JSON with "flags" array.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const report = jsonMatch ? JSON.parse(jsonMatch[0]) : { flags: [], raw: text };
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze contract' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const AppError = require('../utils/errors');

const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'x-ai/grok-4.20';

/**
 * Send a conversation history to OpenRouter and get the assistant's reply.
 * @param {Array<{ role: 'user' | 'assistant' | 'system', content: string }>} messages
 * @returns {Promise<string>} The assistant's reply text
 */
const sendMessage = async (messages) => {
  //console.log('OPENROUTER_API_URL', OPENROUTER_API_URL); // temp
  //console.log('OPENROUTER_MODEL', OPENROUTER_MODEL); // temp
  //console.log('messages', messages); // temp
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages
    })
  });
  console.log('AI response', response); // temp

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new AppError(
      errorBody?.error?.message || 'OpenRouter request failed',
      502
    );
  }

  const data = await response.json();
  //console.log('data', data); // temp
  
  const reply = data?.choices?.[0]?.message?.content;
  
  //console.log('reply', reply); // temp

  if (!reply) {
    throw new AppError('No response received from AI', 502);
  }

  return reply;
};

module.exports = { sendMessage };

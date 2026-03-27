const { generateInterviewQuestions, gradeInterviewAnswer } = require('./src/services/ai.service');
require('dotenv').config();

async function test() {
  console.log('--- Testing Interview Generation ---');
  try {
    const questions = await generateInterviewQuestions('Frontend Developer', 'medium');
    console.log('Result:', JSON.stringify(questions, null, 2));

    console.log('\n--- Testing Answer Grading ---');
    const question = questions.questions[0].question;
    const answer = 'React is a JavaScript library for building user interfaces. It uses a virtual DOM and is component-based.';
    const feedback = await gradeInterviewAnswer(question, answer, 'Frontend Developer', {
      confidenceScore: 90,
      emotionsDetected: ['Confident', 'Calm']
    });
    console.log('Feedback:', JSON.stringify(feedback, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();

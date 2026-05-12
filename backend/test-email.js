require('dotenv').config();
const { sendOtpEmail } = require('./src/services/email.service');

async function test() {
  console.log('Starting email test...');
  try {
    await sendOtpEmail('anandsaurabh1109@gmail.com', '123456', 'signup');
    console.log('Test function finished.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();

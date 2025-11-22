import axios from 'axios';

async function testMovesEndpoint() {
  try {
    console.log('Testing /api/moves endpoint...');
    const response = await axios.get('http://localhost:5000/api/moves');
    console.log('Success! Found', response.data.moves.length, 'moves');
    console.log('First 3 moves:');
    console.log(JSON.stringify(response.data.moves.slice(0, 3), null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testMovesEndpoint();

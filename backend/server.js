// const express = require('express');
// const http = require('http');
// const { WebSocketServer } = require('ws');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const Anthropic = require('@anthropic-ai/sdk');
// const fetch = require('node-fetch');

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocketServer({ server });

// // Initialize Anthropic
// const anthropic = new Anthropic({
//     apiKey: process.env.ANTHROPIC_API_KEY
// });

// app.use(cors());
// app.use(express.json());

// // WebSocket connection handling
// // In server.js
// wss.on('connection', (ws) => {
//   console.log('Client connected with ID:', Math.random().toString(36).substring(7));
  
//   ws.on('message', async (message) => {
//       try {
//           const data = JSON.parse(message);
//           console.log('Received message type:', data.type);
//           console.log('Message content:', data);
          
//           switch (data.type) {
//               case 'SPEECH_INPUT':
//                   try {
//                       console.log('Processing speech input:', data.text);
//                       const aiResponse = await processAIResponse(data.text, data.context);
//                       console.log('AI Response:', aiResponse);
                      
//                       const audioResponse = await generateSpeech(aiResponse);
//                       console.log('Audio generated successfully');
                      
//                       ws.send(JSON.stringify({
//                           type: 'AI_RESPONSE',
//                           text: aiResponse,
//                           audio: audioResponse,
//                       }));
//                   } catch (error) {
//                       console.error('Error in speech processing:', error);
//                       ws.send(JSON.stringify({
//                           type: 'ERROR',
//                           message: error.message
//                       }));
//                   }
//                   break;
                  
//               // ... rest of the cases
//           }
//       } catch (error) {
//           console.error('Error processing message:', error);
//           ws.send(JSON.stringify({
//               type: 'ERROR',
//               message: error.message
//           }));
//       }
//   });

//   ws.on('error', (error) => {
//       console.error('WebSocket error:', error);
//   });

//   ws.on('close', () => {
//       console.log('Client disconnected');
//   });
// });

// // AI Response Processing using Claude
// async function processAIResponse(input, context) {
//     try {
//         const message = await anthropic.messages.create({
//             model: "claude-3-opus-20240229",
//             max_tokens: 1024,
//             messages: [
//                 {
//                     role: "assistant",
//                     content: `You are an AI avatar assistant. Keep responses concise and natural. Context: ${context || 'No specific context provided.'}`
//                 },
//                 {
//                     role: "user",
//                     content: input
//                 }
//             ]
//         });
        
//         return message.content[0].text;
//     } catch (error) {
//         console.error('Claude API error:', error);
//         throw new Error('Error generating AI response');
//     }
// }

// // Speech Generation using ElevenLabs
// // In server.js
// // async function generateSpeech(text) {
// //   try {
// //       const response = await fetch(
// //           'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
// //           {
// //               method: 'POST',
// //               headers: {
// //                   'Accept': 'audio/mpeg',  // Changed to audio/mpeg
// //                   'Content-Type': 'application/json',
// //                   'xi-api-key': process.env.ELEVENLABS_API_KEY
// //               },
// //               body: JSON.stringify({
// //                   text: text,
// //                   model_id: 'eleven_monolingual_v1',
// //                   voice_settings: {
// //                       stability: 0.5,
// //                       similarity_boost: 0.5
// //                   }
// //               })
// //           }
// //       );

// //       if (!response.ok) {
// //           throw new Error(`ElevenLabs API error: ${response.status}`);
// //       }

// //       // Get the audio data as an ArrayBuffer
// //       const audioData = await response.arrayBuffer();
      
// //       // Convert ArrayBuffer to Base64 string for WebSocket transmission
// //       const base64Audio = Buffer.from(audioData).toString('base64');

// //       return base64Audio;
// //   } catch (error) {
// //       console.error('Error generating speech:', error);
// //       throw error;
// //   }
// // }


// // In server.js, update the generateSpeech function
// async function generateSpeech(text) {
//   try {
//       console.log('Generating speech for:', text);
//       const response = await fetch(
//           'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
//           {
//               method: 'POST',
//               headers: {
//                   'Accept': 'audio/mpeg',
//                   'Content-Type': 'application/json',
//                   'xi-api-key': process.env.ELEVENLABS_API_KEY
//               },
//               body: JSON.stringify({
//                   text: text,
//                   model_id: 'eleven_monolingual_v1',
//                   voice_settings: {
//                       stability: 0.5,
//                       similarity_boost: 0.5
//                   }
//               })
//           }
//       );

//       if (!response.ok) {
//           throw new Error(`ElevenLabs API error: ${response.status}`);
//       }

//       const arrayBuffer = await response.arrayBuffer();
//       console.log('Received audio data, size:', arrayBuffer.byteLength);
      
//       // Convert to base64
//       const base64 = Buffer.from(arrayBuffer).toString('base64');
//       console.log('Converted to base64');
      
//       return base64;
//   } catch (error) {
//       console.error('Error in generateSpeech:', error);
//       throw error;
//   }
// }



// // Document Processing
// async function processDocument(document) {
//     try {
//         const message = await anthropic.messages.create({
//             model: "claude-3-opus-20240229",
//             max_tokens: 1024,
//             messages: [
//                 {
//                     role: "user",
//                     content: `Process and summarize this document: ${document}`
//                 }
//             ]
//         });
        
//         return { summary: message.content[0].text };
//     } catch (error) {
//         console.error('Error processing document:', error);
//         throw new Error('Error processing document');
//     }
// }

// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });






// // const express = require('express');
// // const http = require('http');
// // const { WebSocketServer } = require('ws');
// // const cors = require('cors');
// // const { OpenAI } = require('openai');
// // const dotenv = require('dotenv');
// // const elevenlabs = require('elevenlabs');
// // const Anthropic = require('@anthropic-ai/sdk');

// // dotenv.config();

// // const app = express();
// // const server = http.createServer(app);
// // const wss = new WebSocketServer({ server });

// // // Initialize OpenAI
// // // const openai = new OpenAI({ 
// // //     apiKey: process.env.OPENAI_API_KEY
// // // });

// // // Initialize Anthropic
// // const anthropic = new Anthropic({
// //   apiKey: process.env.ANTHROPIC_API_KEY // You'll need to add this to your .env file
// // });

// // // // Initialize ElevenLabs
// // // const elevenlabs = new ElevenLabs({
// // //     apiKey: process.env.ELEVENLABS_API_KEY
// // // });

// // // elevenlabs.setApiKey(process.env.ELEVENLABS_API_KEY);


// // app.use(cors());
// // app.use(express.json());

// // // WebSocket connection handling
// // wss.on('connection', (ws) => {
// //   ws.on('message', async (message) => {
// //     const data = JSON.parse(message);
    
// //     switch (data.type) {
// //       case 'SPEECH_INPUT':
// //         // Process speech input
// //         const aiResponse = await processAIResponse(data.text, data.context);
// //         const audioResponse = await generateSpeech(aiResponse);
        
// //         ws.send(JSON.stringify({
// //           type: 'AI_RESPONSE',
// //           text: aiResponse,
// //           audio: audioResponse,
// //         }));
// //         break;
        
// //       case 'DOCUMENT_UPLOAD':
// //         // Process document context
// //         const embeddings = await processDocument(data.document);
// //         ws.send(JSON.stringify({
// //           type: 'CONTEXT_PROCESSED',
// //           embeddings: embeddings,
// //         }));
// //         break;
// //     }
// //   });
// // });

// // // AI Response Processing

// // async function processAIResponse(input, context) {
// //   const message = await anthropic.messages.create({
// //       model: "claude-3-opus-20240229",
// //       max_tokens: 1024,
// //       messages: [
// //           {
// //               role: "system",
// //               content: `You are an AI avatar assistant. Context: ${context}`
// //           },
// //           {
// //               role: "user",
// //               content: input
// //           }
// //       ]
// //   });
  
// //   return message.content[0].text;
// // }


// // // async function processAIResponse(input, context) {
// // //   const completion = await openai.chat.completions.create({
// // //       model: "gpt-3.5-turbo",  // Changed from "gpt-4" to "gpt-3.5-turbo"
// // //       messages: [
// // //           { role: "system", content: `You are an AI avatar assistant. Context: ${context}` },
// // //           { role: "user", content: input }
// // //       ],
// // //   });
  
// // //   return completion.choices[0].message.content;
// // // }
// // // // Speech Generation
// // // async function generateSpeech(text) {
// // //   const audio = await elevenlabs.textToSpeech({
// // //     text: text,
// // //     voice_id: 'your-voice-id',
// // //     model_id: 'eleven_monolingual_v1'
// // //   });
  
// // //   return audio;
// // // }

// // // Update the generateSpeech function
// // // async function generateSpeech(text) {
// // //   try {
// // //       const audio = await elevenlabs.generate({
// // //           text: text,
// // //           voice_id: "21m00Tcm4TlvDq8ikWAM", // Default voice ID
// // //           model_id: "eleven_monolingual_v1"
// // //       });
// // //       return audio;
// // //   } catch (error) {
// // //       console.error('ElevenLabs error:', error);
// // //       throw error;
// // //   }
// // // }

// // // Update the generateSpeech function
// // // Speech Generation function using ElevenLabs
// // async function generateSpeech(text) {
// //   try {
// //       const audioResponse = await textToSpeech({
// //           apiKey: process.env.ELEVENLABS_API_KEY,
// //           text: text,
// //           voiceId: "21m00Tcm4TlvDq8ikWAM", // Default voice ID
// //           modelId: "eleven_monolingual_v1"
// //       });
      
// //       return audioResponse;
// //   } catch (error) {
// //       console.error('Error generating speech:', error);
// //       throw error;
// //   }
// // }



// // // Document Processing
// // async function processDocument(document) {
// //   const embedding = await openai.embeddings.create({
// //     model: "text-embedding-3-small",
// //     input: document,
// //   });
  
// //   return embedding.data;
// // }

// // const PORT = process.env.PORT || 3001;
// // server.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });



const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initialize Anthropic
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(cors());
app.use(express.json());

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    const clientId = Math.random().toString(36).substring(7);
    console.log(`Client connected with ID: ${clientId}`);
    
    ws.on('message', async (message) => {
      console.log('Raw message received:', message.toString());
        try {
            const data = JSON.parse(message);
            console.log('Received message type:', data.type);
            
            if (data.type === 'PING') {
              ws.send(JSON.stringify({ type: 'PONG' }));
              return;
          }
            
            
            console.log('Received message type:', data.type);
            console.log('Message content:', data);
            
            switch (data.type) {
                case 'SPEECH_INPUT':
                    try {
                        console.log('Processing speech input:', data.text);
                        const aiResponse = await processAIResponse(data.text, data.context);
                        console.log('AI Response:', aiResponse);
                        
                        console.log('Generating speech...');
                        const audioResponse = await generateSpeech(aiResponse);
                        console.log('Audio generated successfully');
                        
                        ws.send(JSON.stringify({
                            type: 'AI_RESPONSE',
                            text: aiResponse,
                            audio: audioResponse,
                        }));
                    } catch (error) {
                        console.error('Error in speech processing:', error);
                        ws.send(JSON.stringify({
                            type: 'ERROR',
                            message: 'Error processing speech: ' + error.message
                        }));
                    }
                    break;
                    
                case 'DOCUMENT_UPLOAD':
                    try {
                        console.log('Processing document...');
                        const embeddings = await processDocument(data.document);
                        console.log('Document processed');
                        ws.send(JSON.stringify({
                            type: 'CONTEXT_PROCESSED',
                            embeddings: embeddings,
                        }));
                    } catch (error) {
                        console.error('Error processing document:', error);
                        ws.send(JSON.stringify({
                            type: 'ERROR',
                            message: 'Error processing document: ' + error.message
                        }));
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Error processing message: ' + error.message
            }));
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log(`Client disconnected`);
    });
});

// AI Response Processing using Claude
async function processAIResponse(input, context) {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1024,
            messages: [
                {
                    role: "assistant",
                    content: `You are an AI avatar assistant. Keep responses concise and natural. Context: ${context || 'No specific context provided.'}`
                },
                {
                    role: "user",
                    content: input
                }
            ]
        });
        
        return message.content[0].text;
    } catch (error) {
        console.error('Claude API error:', error);
        throw new Error('Error generating AI response');
    }
}

// Speech Generation using ElevenLabs
async function generateSpeech(text) {
    try {
        console.log('Generating speech for:', text);
        const response = await fetch(
            'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log('Received audio data, size:', arrayBuffer.byteLength);
        
        // Convert to base64
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log('Converted to base64');
        
        return base64;
    } catch (error) {
        console.error('Error in generateSpeech:', error);
        throw error;
    }
}

// Document Processing
async function processDocument(document) {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: `Process and summarize this document: ${document}`
                }
            ]
        });
        
        return { summary: message.content[0].text };
    } catch (error) {
        console.error('Error processing document:', error);
        throw new Error('Error processing document');
    }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
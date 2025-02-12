import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Upload } from 'lucide-react';
import * as THREE from 'three';

// const AVATAR_URL = 'https://models.readyplayer.me/67aad1e184f3b88e8f128150.glb?morphTargets=ARKit,Oculus Visemes,mouthOpen,mouthSmile';

useGLTF.preload('/avatar.glb');

const WS_RETRY_INTERVAL = 3000;
const MAX_RETRIES = 5;


const Avatar = ({ speaking, emotion = 'neutral' }) => {
    const { scene, animations } = useGLTF('/avatar.glb');
    const { actions, mixer } = useAnimations(animations, scene);
    
    // Remove TypeScript type annotation
    const headRef = useRef(null);
  
    useEffect(() => {
      // Debug logging of animations
      console.log('Available animations:', actions ? Object.keys(actions) : 'No animations');
      
      // Find head mesh and morph targets
      let foundHead = null;
      scene.traverse((object) => {
        // More comprehensive check for head mesh
        if (object instanceof THREE.Mesh) {
          const nameLower = object.name.toLowerCase();
          if (nameLower.includes('head') || nameLower.includes('facial')) {
            foundHead = object;
            console.log('Head mesh found:', object.name);
          }
        }
      });
  
      // Safely set the ref
      if (foundHead) {
        headRef.current = foundHead;
  
        // Log morph targets
        if (foundHead.morphTargetDictionary) {
          console.log('Available morph targets:', 
            Object.keys(foundHead.morphTargetDictionary)
          );
        }
      }
  
      // Position and scale
      scene.scale.set(1, 1, 1);
      scene.position.set(0, -0.8, -0.5);
  
      // Cleanup
      return () => {
        if (mixer) {
          mixer.stopAllAction();
        }
      };
    }, [scene, mixer, actions]);
  
    // Speaking animation
    useEffect(() => {
      const currentHead = headRef.current;
      
      if (speaking && currentHead) {
        const animate = () => {
          if (!speaking || !currentHead) return;
  
          // Simple mouth movement simulation
          const time = Date.now() * 0.001;
          const mouthOpen = Math.sin(time * 8) * 0.5 + 0.5;
  
          // Safely update morph targets
          if (currentHead.morphTargetInfluences && currentHead.morphTargetDictionary) {
            Object.entries(currentHead.morphTargetDictionary).forEach(
              ([key, index]) => {
                if (key.toLowerCase().includes('mouth') || 
                    key.toLowerCase().includes('viseme')) {
                  currentHead.morphTargetInfluences[index] = 
                    key.includes('open') ? mouthOpen : 0;
                }
              }
            );
          }
  
          requestAnimationFrame(animate);
        };
  
        animate();
      } else if (currentHead && currentHead.morphTargetInfluences) {
        // Reset mouth shapes
        currentHead.morphTargetInfluences.fill(0);
      }
    }, [speaking]);
  
    return <primitive object={scene} />;
  };
  


const TalkingAvatar = () => {
  // States
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Helper function to ensure AudioContext is initialized and ready
  const ensureAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('New AudioContext created');
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('AudioContext resumed');
      }

      return true;
    } catch (error) {
      console.error('Error ensuring AudioContext:', error);
      return false;
    }
  };

//   const playAudio = async (base64Audio) => {
//     try {
//       const audioReady = await ensureAudioContext();
//       if (!audioReady) {
//         console.error('AudioContext not ready');
//         return;
//       }

//       console.log('Starting audio playback');
//       const binaryString = atob(base64Audio);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }

//       const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
//       const source = audioContextRef.current.createBufferSource();
//       source.buffer = audioBuffer;
//       source.connect(audioContextRef.current.destination);
      
//       setIsSpeaking(true);
//       source.start(0);
//       console.log('Audio playback started');

//       source.onended = () => {
//         console.log('Audio playback ended');
//         setIsSpeaking(false);
//       };
//     } catch (error) {
//       console.error('Audio playback error:', error);
//       setIsSpeaking(false);
//     }
//   };


const playAudio = async (base64Audio) => {
    try {
      const audioReady = await ensureAudioContext();
      if (!audioReady) {
        console.error('AudioContext not ready');
        return;
      }
  
      console.log('Starting audio playback');
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
  
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      // Start speaking animation slightly before audio
      setIsSpeaking(true);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for animation to start
      
      source.start(0);
      console.log('Audio playback started');
  
      source.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
      };
  
      // Create audio analyzer for real-time volume
      const analyzer = audioContextRef.current.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      // Update animation based on audio volume
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const updateAnimation = () => {
        if (!isSpeaking) return;
        
        analyzer.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Update emotion based on volume
        if (volume > 128) {
          setCurrentEmotion('excited');
        } else if (volume > 64) {
          setCurrentEmotion('neutral');
        } else {
          setCurrentEmotion('calm');
        }
        
        requestAnimationFrame(updateAnimation);
      };
      updateAnimation();
  
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsSpeaking(false);
    }
  };

  const setupWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      console.log('Setting up new WebSocket connection...');
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
      };

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setRetryCount(0);
        wsRef.current = ws;
      };

      ws.onclose = () => {
        console.log('WebSocket Closed');
        setIsConnected(false);
        wsRef.current = null;

        if (retryCount < MAX_RETRIES) {
          console.log(`Reconnecting... Attempt ${retryCount + 1}/${MAX_RETRIES}`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setupWebSocket();
          }, WS_RETRY_INTERVAL);
        }
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data.type);

          if (data.type === 'AI_RESPONSE') {
            // First show text response
            setConversation(prev => [...prev, { role: 'avatar', content: data.text }]);
            
            // Then handle audio if present
            if (data.audio) {
              // Ensure AudioContext is ready before playing
              await ensureAudioContext();
              await playAudio(data.audio);
            }
          }
        } catch (error) {
          console.error('Message handling error:', error);
        }
      };
    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  }, [retryCount]);

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return null;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Speech recognized:', transcript);
      handleSpeechInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    return recognition;
  };

  const handleSpeechInput = async (transcript) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }
    
    console.log('Sending speech input:', transcript);
    wsRef.current.send(JSON.stringify({
      type: 'SPEECH_INPUT',
      text: transcript,
    }));
    
    setConversation(prev => [...prev, { role: 'user', content: transcript }]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'DOCUMENT_UPLOAD',
            document: e.target.result,
          }));
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleMicClick = async () => {
    try {
      // Initialize audio and ensure it's ready
      await ensureAudioContext();

      // Initialize speech recognition if needed
      if (!recognitionRef.current) {
        recognitionRef.current = initializeSpeechRecognition();
      }

      // Toggle listening state
      if (!isListening) {
        recognitionRef.current?.start();
      } else {
        recognitionRef.current?.stop();
      }
    } catch (error) {
      console.error('Error in mic click:', error);
    }
  };

  // Initialize WebSocket
  useEffect(() => {
    setupWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [setupWebSocket]);

  // Keep WebSocket alive
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, []);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <span>AI Avatar Assistant</span>
            <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 p-6">
          <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
            <Canvas
              camera={{ 
                position: [0, 0.5, 2.5],
                fov: 45,
                near: 0.1,
                far: 1000
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <Suspense fallback={null}>
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  minPolarAngle={Math.PI/2.2}
                  maxPolarAngle={Math.PI/1.8}
                  minAzimuthAngle={-Math.PI/4}
                  maxAzimuthAngle={Math.PI/4}
                />
                <ambientLight intensity={0.6} />
                <directionalLight
                  position={[2, 2, 2]}
                  intensity={0.8}
                  castShadow
                />
                <spotLight
                  position={[0, 2, 2]}
                  intensity={0.8}
                  penumbra={1}
                  castShadow
                />
                <Avatar speaking={isSpeaking} emotion={currentEmotion} />
              </Suspense>
            </Canvas>
          </div>
          
          <div className="flex justify-between items-center gap-4">
            <Button
              onClick={handleMicClick}
              className={`flex items-center gap-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
            
            <input
              type="file"
              id="context-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.pdf,.doc,.docx"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('context-upload').click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Context
            </Button>
          </div>
          
          <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border">
            <div className="p-4 space-y-4">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { Avatar, TalkingAvatar };
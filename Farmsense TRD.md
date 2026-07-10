## **TECHNICAL REQUIREMENTS DOCUMENT (TRD)**

### **System Overview**

FarmSense is a client-side Progressive Web Application that communicates with a locally running Gemma 4 model through Ollama. All AI inference including image analysis happens on the host laptop. The frontend is built with HTML, CSS, and Vanilla JavaScript with no frameworks required, keeping the app lightweight and fast.

---

### **Tech Stack**

| Layer | Technology |
| ----- | ----- |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| AI Model | Gemma 4 (via Ollama) |
| Local AI Server | Ollama |
| Image Processing | FileReader API (Base64 conversion) |
| PWA Support | Service Worker, Web App Manifest |
| Local Server | Python HTTP Server or VS Code Live Server |
| Version Control | GitHub |

---

### **System Architecture**

\[User on Phone or Laptop Browser\]  
            ↓  
\[PWA — HTML/CSS/JS Frontend\]  
            ↓  
\[Local WiFi Network\]  
            ↓  
\[Laptop — Python HTTP Server — Port 3000\]  
            ↓  
\[Ollama Local Server — Port 11434\]  
            ↓  
\[Gemma 4 Model — Running Fully Offline\]  
---

### **Gemma 4 Implementation**

#### **How Gemma 4 Is Integrated**

FarmSense uses Gemma 4 as its core intelligence engine. The model is downloaded once during setup and runs entirely offline through Ollama. The web application communicates with Gemma 4 through Ollama's local REST API using JavaScript's native fetch API. Gemma 4 handles both text-based farming queries and image-based crop disease detection using its native multimodal capability.

---

#### **Model Selection by RAM**

| RAM | Recommended Model | Notes |
| ----- | ----- | ----- |
| 8GB | gemma3:2b | Fast and lightweight |
| 16GB | gemma3:4b | Balanced quality and speed |
| 32GB+ | gemma3:12b | Best quality responses |

---

#### **Ollama Setup**

bash  
\# Step 1 — Install Ollama from ollama.com

\# Step 2 — Pull Gemma 4 model  
ollama pull gemma3

\# Step 3 — Start Ollama server accepting connections   
\# from all devices on the network  
OLLAMA\_HOST\=0.0.0.0 ollama serve  
---

#### **System Prompt**

javascript  
const FARMSENSE\_SYSTEM\_PROMPT \= \`You are FarmSense, an expert   
AI agricultural assistant built specifically for smallholder   
farmers in rural Southeast Nigeria. Your role is to:

1\. Diagnose crop diseases based on text symptom descriptions  
2\. Analyze images of crops and identify diseases from visual signs  
3\. Recommend local, practical, and affordable remedies and   
   treatments that farmers can access in rural areas  
4\. Provide farming advice on planting seasons, soil preparation,   
   fertilizer use, pest control, irrigation, and post-harvest storage  
5\. Focus on crops common in Southeast Nigeria including cassava,   
   yam, maize, tomato, palm oil, and rice  
6\. Automatically detect if the user is writing in Igbo and respond   
   fully in Igbo  
7\. Keep all answers simple, practical, and actionable for farmers   
   who may have low literacy levels  
8\. Always be warm, encouraging, and supportive in your tone  
9\. If you cannot diagnose with certainty, ask the farmer for more   
   details about the symptoms or request a clearer image  
10\. Always remind farmers to consult a local extension officer   
    for severe or widespread crop infections\`;  
---

#### **Text-Only Chat API Call**

javascript  
async function askGemma(userMessage, conversationHistory) {  
    const messages \= \[  
        { role: "system", content: FARMSENSE\_SYSTEM\_PROMPT },  
        ...conversationHistory,  
        { role: "user", content: userMessage }  
    \];

    const response \= await fetch(  
        "http://192.168.1.105:11434/api/chat", {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({  
            model: "gemma3",  
            messages: messages,  
            stream: false  
        })  
    });

    const data \= await response.json();  
    return data.message.content;  
}  
---

#### **Image Upload and Analysis API Call**

javascript  
// Step 1 — Convert image file to Base64  
async function convertImageToBase64(imageFile) {  
    return new Promise((resolve, reject) \=\> {  
        const reader \= new FileReader();  
        reader.onload \= () \=\> {  
            // Remove data:image/jpeg;base64, prefix  
            const base64 \= reader.result.split(",")\[1\];  
            resolve(base64);  
        };  
        reader.onerror \= reject;  
        reader.readAsDataURL(imageFile);  
    });  
}

// Step 2 — Send image to Gemma 4 for analysis  
async function askGemmaWithImage(userMessage, imageFile) {  
    const base64Image \= await convertImageToBase64(imageFile);

    const response \= await fetch(  
        "http://192.168.1.105:11434/api/chat", {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({  
            model: "gemma3",  
            messages: \[  
                {   
                    role: "system",   
                    content: FARMSENSE\_SYSTEM\_PROMPT   
                },  
                {  
                    role: "user",  
                    content: \[  
                        {  
                            type: "image",  
                            data: base64Image,  
                            mimeType: "image/jpeg"  
                        },  
                        {  
                            type: "text",  
                            text: userMessage || "What disease does this crop have? Please diagnose and recommend treatment."  
                        }  
                    \]  
                }  
            \],  
            stream: false  
        })  
    });

    const data \= await response.json();  
    return data.message.content;  
}  
---

#### **Conversation Memory**

javascript  
let conversationHistory \= \[\];

async function sendMessage(userMessage, imageFile \= null) {  
    let response;

    if (imageFile) {  
        // Image \+ optional text message  
        response \= await askGemmaWithImage(userMessage, imageFile);  
    } else {  
        // Text only message  
        response \= await askGemma(userMessage, conversationHistory);  
    }

    // Save to conversation history for context  
    conversationHistory.push({   
        role: "user",   
        content: userMessage   
    });  
    conversationHistory.push({   
        role: "assistant",   
        content: response   
    });

    return response;  
}  
---

### **PWA Implementation**

#### **manifest.json**

json  
{  
    "name": "FarmSense",  
    "short\_name": "FarmSense",  
    "description": "Offline AI Farming Assistant for Nigerian Farmers",  
    "start\_url": "/",  
    "display": "standalone",  
    "background\_color": "\#1a472a",  
    "theme\_color": "\#2d6a4f",  
    "icons": \[  
        {  
            "src": "icon-192.png",  
            "sizes": "192x192",  
            "type": "image/png"  
        },  
        {  
            "src": "icon-512.png",  
            "sizes": "512x512",  
            "type": "image/png"  
        }  
    \]  
}

#### **Service Worker**

javascript  
const CACHE\_NAME \= "farmsense-v1";  
const ASSETS \= \[  
    "/",  
    "/index.html",  
    "/style.css",  
    "/app.js",  
    "/manifest.json",  
    "/icon-192.png",  
    "/icon-512.png"  
\];

self.addEventListener("install", event \=\> {  
    event.waitUntil(  
        caches.open(CACHE\_NAME)  
            .then(cache \=\> cache.addAll(ASSETS))  
    );  
});

self.addEventListener("fetch", event \=\> {  
    event.respondWith(  
        caches.match(event.request)  
            .then(response \=\> response || fetch(event.request))  
    );  
});  
---

### **File Structure**

farmsense/  
│  
├── index.html            \# Main app UI and chat interface  
├── style.css             \# All styling and responsive design  
├── app.js                \# Gemma 4 integration and chat logic  
├── manifest.json         \# PWA manifest file  
├── service-worker.js     \# Offline caching service worker  
├── icon-192.png          \# PWA icon small  
├── icon-512.png          \# PWA icon large  
└── README.md             \# Setup and installation instructions  
---

### **Mobile Testing Setup**

Step 1 — Connect laptop and phone to the same WiFi network

Step 2 — Get laptop IP address  
         Windows: run ipconfig in terminal  
         Mac: run ifconfig in terminal  
         Look for IPv4 address e.g. 192.168.1.105

Step 3 — Start Ollama accepting all network connections  
         OLLAMA\_HOST=0.0.0.0 ollama serve

Step 4 — Start local web server in project folder  
         python \-m http.server 3000

Step 5 — Open phone browser and go to  
         http://192.168.1.105:3000

Step 6 — Install as PWA  
         Android Chrome: tap 3 dots menu then Add to Home Screen  
         iPhone Safari: tap Share button then Add to Home Screen  
---

### **Non-Functional Requirements**

* App must load in under 3 seconds on the local WiFi network  
* Gemma 4 must respond to text queries within 30 seconds  
* Gemma 4 must analyze and respond to image queries within 45 seconds  
* App UI must be fully responsive and usable on mobile screen sizes  
* Image uploads must be accepted in JPG, PNG, and WEBP formats  
* App must work on Chrome, Firefox, and Safari browsers


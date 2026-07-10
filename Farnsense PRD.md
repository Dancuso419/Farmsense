## **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

### **Product Name**

FarmSense — Offline AI Farming Assistant

### **Version**

1.0

### **Date**

July 2026

### **Overview**

FarmSense is an offline-first, AI-powered farming assistant designed to help smallholder farmers in rural Nigeria access expert agricultural knowledge without relying on internet connectivity. It combines crop disease diagnosis through image analysis and text description, general farming advisory, and multilingual support in English and Igbo into a single progressive web application powered by Google's Gemma 4 model running locally on a device via Ollama.

---

### **Problem Statement**

Millions of smallholder farmers in rural Southeast Nigeria face the following challenges daily:

* No reliable internet access to search for farming advice  
* Crop diseases go undiagnosed until it is too late, leading to massive yield losses  
* Agricultural extension officers are few and rarely available in rural communities  
* Existing farming apps require constant internet connectivity to function  
* Most farming solutions are available in English only, excluding Igbo-speaking farmers  
* Farmers cannot visually show their crop problems to anyone for diagnosis

These gaps result in poor harvests, food insecurity, and economic hardship for farming families who depend entirely on their land for survival.

---

### **Target Users**

* Smallholder farmers in rural Southeast Nigeria  
* Agricultural extension officers serving rural communities  
* Farming students and agricultural researchers  
* Community leaders in farming communities

---

### **Goals**

* Provide accurate crop disease diagnosis from images and text descriptions without internet  
* Give practical farming advice tailored to Nigerian crops and climate  
* Support both English and Igbo language interactions  
* Be accessible on both laptop and mobile devices as a PWA  
* Be simple enough for low-tech users to operate with minimal training

---

### **Features**

#### **Feature 1 — Crop Disease Diagnosis by Text (FarmSense)**

* User describes crop symptoms in text  
* Gemma 4 analyzes the description and identifies the likely disease  
* App returns a clear diagnosis with local remedy recommendations  
* Covers major Nigerian crops including cassava, yam, maize, tomato, palm oil, and rice  
* Gemma 4 asks follow-up questions if more information is needed for accurate diagnosis

#### **Feature 2 — Image-Based Crop Disease Detection**

* Farmer takes a photo of their sick crop or uploads an existing image from their phone gallery  
* Gemma 4 analyzes the image using its native multimodal capability  
* App returns a visual diagnosis identifying the disease directly from the image  
* Combines image analysis with text description for more accurate and confident diagnosis  
* Supports images of leaves, stems, fruits, and roots  
* Works completely offline as image is processed locally by Gemma 4 on the device

#### **Feature 3 — General Farming Advisory (AgroChat)**

* Conversational farming assistant for all general farming questions  
* Answers questions about planting seasons, soil preparation, fertilizer use, irrigation, pest control, and post-harvest storage  
* Tailored specifically to Southeast Nigerian climate, soil conditions, and farming calendar  
* Maintains conversation context so farmers can ask follow-up questions naturally

#### **Feature 4 — Multilingual Support**

* Users can type in English, Igbo, Yoruba, or Hausa  
* Gemma 4 automatically detects the language from the message and responds in that same language — the farmer never changes a setting  
* Farming and agricultural terms are translated appropriately in each local language response  
* Makes the app accessible to farmers who are not comfortable writing in English

#### **Feature 5 — Offline First**

* App works completely without internet after initial setup and model download  
* All AI inference runs locally via Ollama on the host laptop  
* No user data or crop images leave the device  
* App is accessible on the local WiFi network so phones can connect to the laptop

#### **Feature 6 — PWA Support**

* Installable on Android and iOS devices as a home screen application  
* Works and feels like a native mobile application once installed  
* App shell and assets cached offline via service worker  
* Accessible from phone browser by connecting to laptop on the same WiFi network

---

### **User Stories**

* As a farmer, I want to describe my crop symptoms in text and get a diagnosis so that I can treat my crops before it is too late  
* As a farmer, I want to take a photo of my sick crop and get an instant diagnosis so that I do not need to describe symptoms in words  
* As a farmer, I want to ask farming questions in Igbo so that I can understand the answers clearly  
* As a farmer, I want to use this app without internet so that I can access it from my village  
* As a farmer, I want to ask follow-up questions in the same conversation so that I can get more detailed advice  
* As an extension officer, I want to use this tool to quickly diagnose crop diseases for farmers I visit in the field

---

### **Success Metrics**

* App loads and works fully without internet connection on the local network  
* Gemma 4 accurately identifies common crop diseases from uploaded images  
* Gemma 4 responds to farming queries accurately within 30 seconds  
* App is installable on an Android phone as a PWA  
* Supports at least 10 common Nigerian crop diseases  
* Responds correctly and naturally to Igbo language inputs

---

### **Out of Scope**

* Voice input and output  
* Cloud syncing or user accounts  
* Payments or e-commerce features


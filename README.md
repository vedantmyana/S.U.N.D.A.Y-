# S.U.N.D.A.Y — AI Desktop Voice Assistant

```
   ███████╗    ██╗   ██╗    ███╗   ██╗    ██████╗      █████╗     ██╗   ██╗
   ██╔════╝    ██║   ██║    ████╗  ██║    ██╔══██╗    ██╔══██╗    ╚██╗ ██╔╝
   ███████╗    ██║   ██║    ██╔██╗ ██║    ██║  ██║    ███████║     ╚████╔╝ 
   ╚════██║    ██║   ██║    ██║╚██╗██║    ██║  ██║    ██╔══██║      ╚██╔╝  
   ███████║    ╚██████╔╝    ██║ ╚████║    ██████╔╝    ██║  ██║       ██║   
   ╚══════╝     ╚═════╝     ╚═╝  ╚═══╝    ╚═════╝     ╚═╝  ╚═╝       ╚═╝   
                  [ NEURAL DESKTOP INTELLIGENCE SYSTEM ]
```

**S.U.N.D.A.Y** is a futuristic AI desktop voice assistant featuring a sci-fi HUD interface, a real-time animated multi-layer orange/amber energy core, command console conversation stream, live chrono-telemetry HUD, and a modular backend service architecture.

---

## 🌟 Visual & Architectural Highlights (Phase 1)

1. **S.U.N.D.A.Y Core (Left Panel)**:
   - Real-time HTML5 2D Canvas & SVG visualizer engine with glowing orange/amber plasma core.
   - 8 independent animation layers: Central plasma sphere, rotating concentric HUD rings, radial scanner sweep, orbital satellite nodes, and dynamic particle cloud.
   - Dynamic states: `IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, and `ERROR`.
   - Real-time frequency waveform analyzer preview and telemetry flux meters.

2. **Chat & Command Console (Center Panel)**:
   - Futuristic command console stream with sci-fi cut-corner message bubbles, HUD timestamps, and system directive tags.
   - Interactive command input bar with keyboard dispatch (`Enter`), command history, and futuristic microphone state indicator.

3. **System Telemetry HUD (Right Panel)**:
   - Live synchronized chrono-telemetry (Time `HH:MM:SS`, Date `DD.MM.YYYY`, Uptime clock).
   - Core matrix status indicators (`System Online`, `Voice Status`, `AI Engine`, `Network`, `Processing`).
   - Hardware diagnostic sensors and security protocol matrix.

4. **Settings & Control Matrix**:
   - Futuristic glassmorphic modal with tabbed configuration for Voice models, AI providers (OpenRouter/OpenAI/Gemini/Ollama), visual particle density, and security policies.

5. **Modular Backend Scaffold**:
   - FastAPI modular architecture (`api/`, `services/`, `tools/`, `models/`, `utils/`).
   - Secure environment configuration without exposing credentials to frontend.

---

## 📁 Project Directory Structure

```
sunday-ai/
├── frontend/
│   ├── index.html              # Main HUD Interface
│   ├── css/
│   │   ├── main.css            # Design tokens, reset, modal, footer
│   │   ├── core.css            # S.U.N.D.A.Y Core canvas & HUD rings
│   │   ├── chat.css            # Conversation console & command input bar
│   │   ├── hud.css             # Telemetry blocks, clock, diagnostic meters
│   │   └── responsive.css      # Adaptability from 1366x768 to 1920x1080+
│   └── js/
│       ├── app.js              # Application orchestrator
│       ├── core.js             # Multi-layer canvas visualizer engine
│       ├── chat.js             # Conversation management
│       ├── voice.js            # Microphone UI & waveform visualizer
│       ├── system.js           # Live chrono telemetry & sensor monitor
│       └── ui.js               # Modal controls & HUD state stepper
│
├── backend/
│   ├── main.py                 # FastAPI application server
│   ├── config.py               # Pydantic settings & configuration
│   ├── requirements.txt        # Backend dependencies
│   ├── .env.example            # Environment variables template
│   ├── api/                    # Route handlers (chat, voice, system)
│   ├── services/               # AI provider abstraction, speech & TTS services
│   ├── tools/                  # Controlled desktop automation tools
│   ├── models/                 # Conversation & request schemas
│   └── utils/                  # Structured logger
│
└── README.md                   # Documentation
```

---

## 🚀 How to Run (Phase 1)

### Option A: Launching Frontend Directly (Recommended for Phase 1)

You can serve the frontend with any local HTTP server:

```powershell
# Using Python built-in HTTP server:
cd C:\Users\SANIKA\.gemini\antigravity\scratch\sunday-ai\frontend
python -m http.server 3000
```
Then open your browser to: **`http://localhost:3000`**

*(Or simply open `frontend/index.html` in modern Chrome / Edge).*

### Option B: Running with FastAPI Backend

```powershell
cd C:\Users\SANIKA\.gemini\antigravity\scratch\sunday-ai
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```
Then open: **`http://127.0.0.1:8000/app/`**

---

## 📋 Development Roadmap

- [x] **Phase 1: UI/UX Structure & Architecture Setup** (Complete)
- [ ] **Phase 2: S.U.N.D.A.Y Core Advanced Visual Dynamics** (Fine-tuning audio-reactive shaders, particle physics, and state transitions)
- [ ] **Phase 3: Real-Time Voice Reaction** (Web Audio API FFT microphone analysis connected to core particles and waveform)
- [ ] **Phase 4: FastAPI Backend Full Service Integration**
- [ ] **Phase 5: AI Engine Connection** (OpenRouter / Multi-model inference)
- [ ] **Phase 6: Text-to-Speech (TTS) Voice Synthesis** (Real-time audio-reactive core speaking dynamics)
- [ ] **Phase 7: Controlled Desktop Automation Tools** (Browser, Apps, System Operations)
- [ ] **Phase 8: Polish & Optimization**

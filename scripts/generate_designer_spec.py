import os
import base64
import subprocess
import shutil

PROJECT_DIR = r"d:\globel\using capeciter\greesal-first-web-version"
IMAGES_DIR = os.path.join(PROJECT_DIR, "public", "images")
OUTPUT_HTML = os.path.join(PROJECT_DIR, "Greesal_UI_UX_Design_Specification.html")
OUTPUT_PDF = os.path.join(PROJECT_DIR, "Greesal_UI_UX_Design_Specification.pdf")
TEMP_PDF = os.path.join(os.environ.get("TEMP", r"C:\Windows\Temp"), "greesal_spec_temp.pdf")

def get_base64_image(filename):
    path = os.path.join(IMAGES_DIR, filename)
    if not os.path.exists(path):
        return ""
    mime = "image/png" if filename.endswith(".png") else "image/jpeg"
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{data}"

# Pre-load all key images
img_logo = get_base64_image("greesal_clean_logo.png")
img_hero = get_base64_image("salad_bowl_hero.jpg")
img_bowl = get_base64_image("exact_salad_bowl.png")
img_screen = get_base64_image("greesal_exact_screen.png")
img_target_ui = get_base64_image("target_ui_mockup.png")
img_ref_ui = get_base64_image("reference_ui.png")
img_lifestyle = get_base64_image("founder_lifestyle.jpg")
img_leaves = get_base64_image("card_leaves.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Greesal - Complete Project Documentation, Architecture & UI/UX Specification</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {{
    size: A4 portrait;
    margin: 12mm 14mm 14mm 14mm;
    @bottom-right {{
      content: "Page " counter(page);
      font-size: 8pt;
      color: #64748b;
    }}
  }}

  * {{
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}

  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.5;
    font-size: 9pt;
    margin: 0;
    padding: 0;
  }}

  h1, h2, h3, h4 {{
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    margin-top: 0;
    font-weight: 700;
  }}

  .page-break {{
    page-break-before: always;
    break-before: page;
  }}

  .avoid-break {{
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  /* HEADER & COVER */
  .cover-container {{
    padding: 24px 20px 18px 20px;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #ffffff 100%);
    border-radius: 18px;
    border: 1.5px solid #bbf7d0;
    margin-bottom: 18px;
    position: relative;
    overflow: hidden;
  }}

  .cover-badge {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #16a34a;
    color: #ffffff;
    font-size: 8pt;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 10px;
  }}

  .cover-title {{
    font-size: 23pt;
    line-height: 1.15;
    color: #14532d;
    margin-bottom: 8px;
    font-weight: 800;
  }}

  .cover-subtitle {{
    font-size: 10.5pt;
    color: #334155;
    max-width: 620px;
    margin-bottom: 14px;
    line-height: 1.45;
  }}

  .meta-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(22, 163, 74, 0.2);
  }}

  .meta-item {{
    background: rgba(255, 255, 255, 0.9);
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid #dcfce7;
  }}

  .meta-label {{
    font-size: 7pt;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }}

  .meta-val {{
    font-size: 9pt;
    font-weight: 700;
    color: #14532d;
  }}

  /* SECTION HEADERS */
  .section-title {{
    font-size: 13.5pt;
    color: #14532d;
    border-bottom: 2px solid #22c55e;
    padding-bottom: 5px;
    margin-top: 18px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}

  .section-number {{
    font-size: 9pt;
    background: #dcfce7;
    color: #166534;
    padding: 2px 7px;
    border-radius: 5px;
    font-weight: 700;
  }}

  /* CARDS & CONTAINERS */
  .card {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }}

  .card-highlight {{
    background: #f8fafc;
    border-left: 4px solid #16a34a;
  }}

  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }}

  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }}

  .grid-4 {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }}

  /* COLOR PALETTE */
  .color-swatch {{
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background: #ffffff;
  }}

  .swatch-color {{
    height: 40px;
    width: 100%;
  }}

  .swatch-info {{
    padding: 5px 7px;
    font-size: 7.5pt;
  }}

  .swatch-name {{
    font-weight: 700;
    color: #0f172a;
  }}

  .swatch-hex {{
    font-family: 'JetBrains Mono', monospace;
    color: #64748b;
    font-size: 7pt;
  }}

  .swatch-role {{
    font-size: 6.8pt;
    color: #059669;
    margin-top: 1px;
    font-weight: 600;
  }}

  /* IMAGE STYLES */
  .img-showcase {{
    width: 100%;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    object-fit: cover;
    display: block;
  }}

  .img-container {{
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: #f1f5f9;
  }}

  .img-caption {{
    font-size: 7pt;
    color: #64748b;
    text-align: center;
    margin-top: 4px;
    font-weight: 600;
  }}

  /* BADGES & PILLS */
  .pill {{
    display: inline-block;
    padding: 2px 7px;
    border-radius: 5px;
    font-size: 7pt;
    font-weight: 600;
    margin-right: 3px;
    margin-bottom: 3px;
  }}

  .pill-green {{ background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }}
  .pill-amber {{ background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }}
  .pill-blue {{ background: #e0f2fe; color: #075985; border: 1px solid #bae6fd; }}
  .pill-purple {{ background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }}
  .pill-gray {{ background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }}

  /* TABLES */
  table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 8pt;
    margin-bottom: 10px;
  }}

  th {{
    background-color: #f8fafc;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 7px 9px;
    border-bottom: 2px solid #cbd5e1;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  td {{
    padding: 7px 9px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }}

  tr:nth-child(even) td {{
    background-color: #fafbfc;
  }}

  /* CODE BOX */
  .code-block {{
    font-family: 'JetBrains Mono', monospace;
    background: #0f172a;
    color: #e2e8f0;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 7.2pt;
    line-height: 1.4;
    overflow-x: auto;
    margin: 6px 0;
  }}

  /* BULLETS & LISTS */
  ul {{
    margin: 3px 0 8px 0;
    padding-left: 16px;
  }}

  li {{
    margin-bottom: 3px;
  }}

  .callout {{
    background: #ecfdf5;
    border-left: 3px solid #10b981;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 8pt;
    margin: 8px 0;
    color: #064e3b;
  }}

  .callout-title {{
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 2px;
  }}

  .arch-box {{
    border: 1.5px dashed #22c55e;
    background: #f0fdf4;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
  }}
</style>
</head>
<body>

<!-- PAGE 1: COVER & EXECUTIVE SUMMARY -->
<div class="cover-container">
  <div class="cover-badge">🌿 Complete Project Documentation & Master Specification</div>
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <h1 class="cover-title">GREESAL<br><span style="font-size: 16pt; font-weight: 600; color: #16a34a;">Farm-Fresh Organic Salad Bowls & Clean Nutrition</span></h1>
      <div class="cover-subtitle">
        Comprehensive Project Description, Full-Stack Architecture, REST API Reference, Database Schemas, Customer Experience Flow, and Admin Operations for Next.js, Capacitor Android & React Native Expo.
      </div>
    </div>
    <div style="text-align: right;">
      <img src="{img_logo}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 14px; background: white; padding: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); border: 1px solid #bbf7d0;" alt="Greesal Logo">
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Project Name</div>
      <div class="meta-val">Greesal Living Platform</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Target Launch Market</div>
      <div class="meta-val">Surat (Katargam & Vesu)</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Delivery SLA</div>
      <div class="meta-val">30-Min Fresh Express</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Tech Ecosystem</div>
      <div class="meta-val">Next.js 14 + Python + Capacitor</div>
    </div>
  </div>
</div>

<div class="grid-2 avoid-break">
  <div class="card card-highlight">
    <h3 style="color: #166534; margin-bottom: 5px; font-size: 10.5pt;">🎯 What is Greesal?</h3>
    <p style="margin: 0; color: #334155; font-size: 8.5pt;">
      <strong>Greesal</strong> is a hyper-local, direct-to-consumer (D2C) organic health-tech food platform. It delivers handcrafted, chef-designed organic salad bowls made with <strong>100% pesticide-free hydroponic greens</strong>, plant proteins, and signature freeze-dried cold-blended herb dressings. Customers receive transparent macro and micro nutritional data (protein, carbs, fat, fiber, sodium, vitamins) for every meal, backed by a strict <strong>30-minute delivery SLA</strong>.
    </p>
  </div>
  <div class="card card-highlight" style="border-left-color: #0284c7;">
    <h3 style="color: #0369a1; margin-bottom: 5px; font-size: 10.5pt;">📱 Cross-Platform Architecture</h3>
    <p style="margin: 0; color: #334155; font-size: 8.5pt;">
      The platform unites three core distribution touchpoints:
      <br><strong>1. Responsive Web Storefront:</strong> High-performance Next.js 14 PWA with instant filtering and slide-over checkout.
      <br><strong>2. Native Android App:</strong> Capacitor 8.5 container with hardware geolocation and back button navigation.
      <br><strong>3. Expo Mobile Companion:</strong> Standalone React Native WebView app for ultra-fast mobile deployment.
    </p>
  </div>
</div>

<div class="section-title">
  <span>1. Core Project Vision, Problem Statement & Market Opportunity</span>
  <span class="section-number">SECTION 01</span>
</div>

<div class="grid-2 avoid-break">
  <div class="card">
    <h4 style="color: #dc2626; margin-bottom: 5px; font-size: 9.5pt;">⚠️ The Problem in Modern Urban Nutrition</h4>
    <ul>
      <li><strong>Pesticide & Chemical Contamination:</strong> Over 85% of market produce contains chemical pesticide residues and heavy metals.</li>
      <li><strong>Opaque Nutritional Profiles:</strong> Restaurant and delivery salads hide high-calorie artificial dressings, sugars, and trans-fats.</li>
      <li><strong>Delayed Delivery & Wilted Greens:</strong> Standard 45–60 min food delivery turns crisp greens soggy, depleting essential micronutrients.</li>
      <li><strong>Friction in Ordering:</strong> Traditional food apps require lengthy registrations, excessive popups, and cumbersome checkouts.</li>
    </ul>
  </div>
  <div class="card">
    <h4 style="color: #16a34a; margin-bottom: 5px; font-size: 9.5pt;">✅ The Greesal Solution & USPs</h4>
    <ul>
      <li><strong>100% Hydroponic & Pesticide-Free:</strong> Harvested clean from precision indoor hydroponic farms with zero soil pathogens.</li>
      <li><strong>Freeze-Dried & Cold-Blended Dressings:</strong> Preserves 98% of natural vitamins, live enzymes, and aromatic herb oils without synthetic preservatives.</li>
      <li><strong>30-Minute Hyper-Local Cloud Kitchen:</strong> Strategic cloud kitchens located in Katargam & Vesu (Surat) to guarantee crunch and vitality.</li>
      <li><strong>Frictionless 3-Click Checkout:</strong> One-tap phone OTP / Google sign-in, GPS auto-location, and instant WhatsApp / UPI checkout.</li>
    </ul>
  </div>
</div>

<div class="grid-3 avoid-break" style="margin-top: 6px;">
  <div class="card" style="padding: 8px;">
    <div class="img-container" style="height: 125px;">
      <img src="{img_screen}" class="img-showcase" style="height: 100%;" alt="Current UI Split-Screen">
    </div>
    <div class="img-caption">Responsive Storefront & Split Auth View</div>
  </div>
  <div class="card" style="padding: 8px;">
    <div class="img-container" style="height: 125px;">
      <img src="{img_hero}" class="img-showcase" style="height: 100%;" alt="Signature Fresh Bowl">
    </div>
    <div class="img-caption">Signature Hydroponic Salad Bowl</div>
  </div>
  <div class="card" style="padding: 8px;">
    <div class="img-container" style="height: 125px;">
      <img src="{img_target_ui}" class="img-showcase" style="height: 100%;" alt="Target Reference Mockup">
    </div>
    <div class="img-caption">Glassmorphic Modern Mobile Experience</div>
  </div>
</div>

<!-- PAGE 2: COMPLETE FULL-STACK ARCHITECTURE & DATA FLOW -->
<div class="page-break"></div>

<div class="section-title">
  <span>2. Complete Full-Stack Architecture & System Engineering</span>
  <span class="section-number">SECTION 02</span>
</div>

<p style="margin-top: 0; color: #475569; font-size: 8.5pt;">
  Greesal is engineered as a modern, decoupled, multi-tiered health-tech application designed for 99.9% uptime, micro-second UI responsiveness, and real-time order state orchestration.
</p>

<div class="card card-highlight avoid-break">
  <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 9.5pt;">🏗️ Multi-Tier System Topology</h4>
  <table style="margin-bottom: 0;">
    <thead>
      <tr>
        <th style="width: 22%;">Layer</th>
        <th style="width: 38%;">Technologies & Libraries</th>
        <th style="width: 40%;">Core Responsibilities</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Web Frontend & PWA</strong></td>
        <td>Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide React</td>
        <td>High-converting SSR/CSR storefront, interactive catalog, nutritional calculators, slide-over cart, digital invoice rendering, and live GPS geolocation.</td>
      </tr>
      <tr>
        <td><strong>Android Native Container</strong></td>
        <td>Capacitor 8.5 (@capacitor/android, @capacitor/cli, @capacitor/core), Android Studio Gradle build</td>
        <td>Hardware device bridging (GPS Geolocation, Camera, Status Bar, hardware back-key listener), APK compilation, offline asset caching.</td>
      </tr>
      <tr>
        <td><strong>React Native Companion</strong></td>
        <td>Expo 51 / React Native WebView, Safe Area View, BackHandler</td>
        <td>Rapid cross-platform mobile container with automatic local network development bridging and server health monitoring.</td>
      </tr>
      <tr>
        <td><strong>Backend API Service</strong></td>
        <td>Python 3.13, FastAPI / Flask, Pydantic v2, Uvicorn, Python-Dotenv</td>
        <td>Asynchronous REST API microservice handling orders, dynamic salad inventory, store operational settings, user profiles, and kitchen notifications.</td>
      </tr>
      <tr>
        <td><strong>Database & Storage</strong></td>
        <td>MongoDB Atlas, Mongoose ODM, MongoDB Node.js Native Driver, MongoDB-Memory-Server</td>
        <td>Document-based persistence for salad recipes, macro matrices, customer orders, operational schedules, and user session records.</td>
      </tr>
      <tr>
        <td><strong>Auth & Integrations</strong></td>
        <td>Next-Auth 4.24, Google OAuth 2.0, Nodemailer, WhatsApp Business Direct API</td>
        <td>Passwordless OTP verification, Google one-tap login, automatic WhatsApp kitchen dispatch, and real-time delivery coordinate verification.</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="grid-2 avoid-break" style="margin-top: 10px;">
  <div class="card">
    <h4 style="color: #14532d; margin-bottom: 6px; font-size: 9.5pt;">🔄 End-to-End Order Lifecycle Flow</h4>
    <div style="font-size: 8pt; line-height: 1.5; color: #334155;">
      <strong>1. Discovery & Selection:</strong> Customer filters salads by dietary tag (High Protein / Detox / Keto) ➔ selects optional add-ons (extra paneer, avocado, cold-blended dressing).<br>
      <strong>2. Geolocation Verification:</strong> GPS auto-locates customer in Surat (Katargam / Vesu / Adajan) and calculates delivery SLA (30 mins).<br>
      <strong>3. Checkout & Payment:</strong> Slide-over cart computes free delivery progress (threshold ₹499) ➔ Customer submits with Cash/UPI on delivery.<br>
      <strong>4. WhatsApp & Database Dispatch:</strong> Order persists in MongoDB and immediately formats a pre-filled WhatsApp dispatch message to the kitchen operations phone.<br>
      <strong>5. Real-Time Kitchen Kanban:</strong> Kitchen admin views order card ➔ moves status: <em>Placed ➔ Preparing ➔ On the Way ➔ Delivered</em>.<br>
      <strong>6. Digital Receipt:</strong> Customer receives instant printable PDF digital invoice with itemized tax and nutritional summary.
    </div>
  </div>

  <div class="card">
    <h4 style="color: #0369a1; margin-bottom: 6px; font-size: 9.5pt;">🛡️ Security, Rate-Limiting & Governance</h4>
    <div style="font-size: 8pt; line-height: 1.5; color: #334155;">
      <strong>• In-Memory Sliding-Window Rate Limiter:</strong> Protects OTP endpoints (`lib/rate-limiter.ts`) from brute-force attempts with IP-based throttling (maximum 5 requests per 10 minutes).<br>
      <strong>• Role-Based Route Guards:</strong> Kitchen administration (`/admin`) is fortified with encrypted admin tokens, session checks, and automatic logout upon inactivity.<br>
      <strong>• Sanitized Pydantic Schemas:</strong> Strict type validation on all incoming payload bodies to prevent NoSQL injection and parameter tampering.<br>
      <strong>• Cross-Origin Security:</strong> Configured CORS headers restricting mobile Capacitor and web clients with cleartext exceptions solely for local dev emulators.
    </div>
  </div>
</div>

<div class="callout avoid-break">
  <div class="callout-title">⚡ Zero-Latency Performance Benchmark</div>
  Client-side filtering runs with <strong>0ms reload latency</strong> using pre-cached Next.js static props, while image assets leverage WebP compression and Next.js Image optimization for sub-second visual load times on 4G/5G mobile networks.
</div>

<!-- PAGE 3: BRAND DESIGN SYSTEM, COLOR PALETTE & TYPOGRAPHY -->
<div class="page-break"></div>

<div class="section-title">
  <span>3. Brand Design System, Color Palette & UI Tokens</span>
  <span class="section-number">SECTION 03</span>
</div>

<p style="margin-top: 0; color: #475569; font-size: 8.5pt;">
  The Greesal aesthetic balances <strong>organic vitality</strong> (emerald greens, crisp white, herbal tints) with <strong>modern tech precision</strong> (sleek dark cards, micro-glassmorphism, vibrant macro callouts).
</p>

<div class="grid-4 avoid-break" style="margin-bottom: 12px;">
  <div class="color-swatch">
    <div class="swatch-color" style="background: #16a34a;"></div>
    <div class="swatch-info">
      <div class="swatch-name">Brand Emerald</div>
      <div class="swatch-hex">#16A34A</div>
      <div class="swatch-role">Primary Buttons, Active Badges</div>
    </div>
  </div>
  <div class="color-swatch">
    <div class="swatch-color" style="background: #14532d;"></div>
    <div class="swatch-info">
      <div class="swatch-name">Deep Forest</div>
      <div class="swatch-hex">#14532D</div>
      <div class="swatch-role">Headlines, Brand Contrast, Hero</div>
    </div>
  </div>
  <div class="color-swatch">
    <div class="swatch-color" style="background: #059669;"></div>
    <div class="swatch-info">
      <div class="swatch-name">Fresh Jade</div>
      <div class="swatch-hex">#059669</div>
      <div class="swatch-role">Nutrition Accents, Trust Icons</div>
    </div>
  </div>
  <div class="color-swatch">
    <div class="swatch-color" style="background: #ecfdf5; border-bottom: 1px solid #bbf7d0;"></div>
    <div class="swatch-info">
      <div class="swatch-name">Mint Mist</div>
      <div class="swatch-hex">#ECFDF5</div>
      <div class="swatch-role">Card Backgrounds, Light Highlights</div>
    </div>
  </div>
</div>

<div class="grid-4 avoid-break" style="margin-bottom: 12px;">
  <div class="color-swatch">
    <div class="swatch-color" style="background: #0f172a;"></div>
    <div class="swatch-info">
      <div class="swatch-name">Slate Obsidian</div>
      <div class="swatch-hex">#0F172A</div>
      <div class="swatch-role">Primary Text, Dark Mode Surface</div>
    </div>
  </div>
  <div class="color-swatch">
    <div class="swatch-color" style="background: #f59e0b;"></div>
    <div class="swatch-info">
      <div class="swatch-name">Golden Harvest</div>
      <div class="swatch-hex">#F59E0B</div>
      <div class="swatch-role">Ratings, Bestseller Ribbons</div>
    </div>
  </div>
  <div class="color-swatch">
    <div class="swatch-color" style="background: #f8fafc; border-bottom: 1px solid #cbd5e1;"></div>
    <div class="swatch-info">
      <div class="swatch-name">Clean Porcelain</div>
      <div class="swatch-hex">#F8FAFC</div>
      <div class="swatch-role">App Background, Neutral Panels</div>
    </div>
  </div>
  <div class="color-swatch">
    <div class="swatch-color" style="background: #ef4444;"></div>
    <div class="swatch-info">
      <div class="swatch-name">Coral Energy</div>
      <div class="swatch-hex">#EF4444</div>
      <div class="swatch-role">Favorite Hearts, Urgent Alerts</div>
    </div>
  </div>
</div>

<div class="grid-2 avoid-break">
  <div class="card">
    <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 9.5pt;">🔤 Typography & Font Hierarchy</h4>
    <table style="margin: 0;">
      <tr>
        <th style="width: 28%;">Element</th>
        <th style="width: 37%;">Font Family</th>
        <th>Weights & Styles</th>
      </tr>
      <tr>
        <td><strong>Primary Titles</strong></td>
        <td>Outfit / Plus Jakarta Sans</td>
        <td>Bold 700 / ExtraBold 800</td>
      </tr>
      <tr>
        <td><strong>Body & Descriptions</strong></td>
        <td>Plus Jakarta Sans</td>
        <td>Regular 400, Medium 500</td>
      </tr>
      <tr>
        <td><strong>Macros & Prices</strong></td>
        <td>Outfit / JetBrains Mono</td>
        <td>SemiBold 600, Bold 700 (e.g., ₹349, 19g)</td>
      </tr>
      <tr>
        <td><strong>Badges & Pills</strong></td>
        <td>Plus Jakarta Sans</td>
        <td>SemiBold 600, Letter-spacing +0.5px</td>
      </tr>
    </table>
  </div>

  <div class="card">
    <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 9.5pt;">✨ UI Styling & Surface Effects</h4>
    <ul>
      <li><strong>Glassmorphic Acrylic:</strong> <code>backdrop-filter: blur(12px)</code> with <code>rgba(255, 255, 255, 0.88)</code> and a subtle border <code>rgba(22, 163, 74, 0.15)</code>.</li>
      <li><strong>Corner Radii Hierarchy:</strong> Micro Pills <code>9999px</code>, Product Cards <code>18px</code>, Modals & Cart Drawers <code>24px</code> to <code>30px</code>.</li>
      <li><strong>Elevation Shadows:</strong> Organic green drop glow — <code>0 10px 25px -5px rgba(22, 163, 74, 0.12)</code>.</li>
      <li><strong>Botanical Leaf Motifs:</strong> Semi-transparent herb silhouettes positioned softly at corner visual anchors.</li>
    </ul>
  </div>
</div>

<!-- PAGE 4: DETAILED CUSTOMER APP FEATURES & SCREEN BLUEPRINTS -->
<div class="page-break"></div>

<div class="section-title">
  <span>4. Customer Storefront Features & Screen Architecture</span>
  <span class="section-number">SECTION 04</span>
</div>

<p style="color: #475569; font-size: 8.5pt; margin-top: 0;">
  The customer-facing application is engineered for rapid decision-making, visual delight, and zero-friction purchase conversion across 8 core interactive views:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 20%;">Screen / View</th>
      <th style="width: 38%;">Key Components & UI Controls</th>
      <th style="width: 42%;">User Experience & Micro-Interactions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Sticky Header & Hub Selector</strong></td>
      <td>
        • Brand Logo & clean SVG icon<br>
        • GPS Auto-detect location picker (Surat Katargam / Vesu)<br>
        • Live Kitchen Status indicator (🟢 Open / 🔴 Closed)<br>
        • Cart Trigger with animated badge counter<br>
        • User Account / Login drawer button
      </td>
      <td>
        Persistent frosted glassmorphic navigation bar. Provides immediate geographical delivery assurance and operational hours visibility.
      </td>
    </tr>
    <tr>
      <td><strong>2. Dynamic Hero Showcase</strong></td>
      <td>
        • Headline value proposition & organic badge<br>
        • USP Pills (100% Hydroponic, Freeze-Dried Dressing)<br>
        • Highlight Trio (30-min express, Zero Chemicals, 4.9 Rating)<br>
        • Primary CTA: "Browse Fresh Bowls" (Smooth scroll)<br>
        • High-definition floating salad bowl image
      </td>
      <td>
        Captivates user attention within 2 seconds. Features floating leaf physics and interactive CTA scroll linking directly to the salad catalog.
      </td>
    </tr>
    <tr>
      <td><strong>3. Instant Category & Search Bar</strong></td>
      <td>
        • Real-time search input with zero-latency filter<br>
        • Category Pills: All Bowls, High Protein, Bestsellers, Detox & Diet, Chef's Special, Saved Favorites<br>
        • Dietary Toggles: 🟢 Vegetarian, 🌱 Vegan, 🌾 Gluten-Free
      </td>
      <td>
        Horizontal scrollable pills on mobile devices with haptic feedback. Instant DOM re-filtering with smooth Framer Motion layout animations.
      </td>
    </tr>
    <tr>
      <td><strong>4. Interactive Salad Card</strong></td>
      <td>
        • High-res salad photography with subtle zoom on hover<br>
        • Wishlist Heart toggle with local persistence<br>
        • Macro highlight ribbon (🔥 Calories, ⚡ Protein)<br>
        • Price & strike-through original price<br>
        • Stepper (+ / -) or "+ Add" button with cart sync
      </td>
      <td>
        Primary conversion driver. Clean macro breakdown prevents decision paralysis. Features an energetic "+1" bouncing indicator upon cart addition.
      </td>
    </tr>
    <tr>
      <td><strong>5. Product Detail & Nutrition Modal</strong></td>
      <td>
        • Full-width image carousel & ingredient origin info<br>
        • Circular Macro Breakdown (Carbs, Fiber, Fats, Protein)<br>
        • Detailed Micronutrient Audit (Vitamins A/C/D/E, Sodium, Iron, Potassium)<br>
        • Add-On Customizer (extra paneer, seed mixes, dressings)<br>
        • Sticky bottom "Add to Cart (₹Total)" action bar
      </td>
      <td>
        Satisfies fitness, gym-goers, and health enthusiasts who count macros. Opens as a frosted modal on desktop and native bottom sheet on mobile.
      </td>
    </tr>
    <tr>
      <td><strong>6. Slide-Over Cart & Checkout Drawer</strong></td>
      <td>
        • Itemized cart listing with quantity adjustments<br>
        • Selected add-ons display per bowl<br>
        • Free Delivery Progress Bar ("Add ₹150 for Free Delivery")<br>
        • Delivery address selector with GPS button & landmark notes<br>
        • Bill breakdown: Subtotal, Delivery Fee, Net Payable<br>
        • 1-Click WhatsApp Order or Cash/UPI on Delivery
      </td>
      <td>
        3-click frictionless checkout. Doesn't force password creation; validates phone number seamlessly with instant OTP.
      </td>
    </tr>
    <tr>
      <td><strong>7. Digital Invoice & Status Stepper</strong></td>
      <td>
        • Unique Order Number (e.g. #GRS-9842) & timestamp<br>
        • 4-Stage Status Stepper: Placed ➔ Preparing ➔ On the Way ➔ Delivered<br>
        • Itemized receipt with printable PDF layout<br>
        • Direct WhatsApp Share & Kitchen Support Hotline
      </td>
      <td>
        Generates clean, printable receipts for corporate expense claims and provides clear visual progress of their 30-minute delivery.
      </td>
    </tr>
    <tr>
      <td><strong>8. Mobile App Bottom Navigation Bar</strong></td>
      <td>
        • 4 Core Navigation Tabs: 🏠 Home, 🥗 Menu, ❤️ Favorites, 👤 Account<br>
        • Floating Cart trigger with live price and item count
      </td>
      <td>
        Tailored for Capacitor and Expo native mobile experiences with safe-area insets, notch accommodation, and Android back button integration.
      </td>
    </tr>
  </tbody>
</table>

<!-- PAGE 5: MENU CATALOG, NUTRITIONAL MATRICES & ADD-ONS -->
<div class="page-break"></div>

<div class="section-title">
  <span>5. Signature Menu Catalog & Nutritional Data Matrix</span>
  <span class="section-number">SECTION 05</span>
</div>

<p style="color: #475569; font-size: 8.5pt; margin-top: 0;">
  Authentic production recipes, macronutrient values, and culinary formulas configured directly inside the Greesal database:
</p>

<div class="grid-2 avoid-break">
  <div class="card">
    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
      <img src="{img_bowl}" style="width: 50px; height: 50px; object-fit: contain;" alt="Bowl">
      <div>
        <h4 style="margin: 0; color: #14532d; font-size: 10.5pt;">Premium High Protein Salad</h4>
        <span class="pill pill-green">⚡ 19g Plant Protein</span>
        <span class="pill pill-amber">🔥 387 Kcal</span>
      </div>
    </div>
    <p style="margin: 0 0 5px 0; font-size: 7.8pt; color: #475569;">
      <strong>Price:</strong> ₹349 <del style="color:#94a3b8;">₹399</del> &nbsp;|&nbsp; <strong>Prep Time:</strong> 10-15 mins &nbsp;|&nbsp; <strong>Rating:</strong> 4.9 ★ (142 reviews)
    </p>
    <div style="font-size: 7.8pt; color: #334155; line-height: 1.45;">
      <strong>Core Ingredients:</strong> Boiled Organic Chickpeas, Grated Beetroot, Fresh Cabbage, Zucchini (yellow & green), Crunchy Carrot, Capsicum, Ruby Pomegranate, Pumpkin, Watermelon, Sunflower & Flax Seeds.<br>
      <strong>Dressing:</strong> Cashew, Fresh Parsley, Mint, Wild Honey, Cold-blended Basil Herb Emulsion.<br>
      <strong>Micronutrients:</strong> Carbs 38g, Fiber 11g, Sodium 280mg, Potassium 420mg, Vitamins A, C, K.
    </div>
  </div>

  <div class="card">
    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
      <img src="{img_hero}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" alt="Bowl">
      <div>
        <h4 style="margin: 0; color: #14532d; font-size: 10.5pt;">Detox Green Superfood Bowl</h4>
        <span class="pill pill-blue">🌱 100% Hydroponic</span>
        <span class="pill pill-amber">🔥 290 Kcal</span>
      </div>
    </div>
    <p style="margin: 0 0 5px 0; font-size: 7.8pt; color: #475569;">
      <strong>Price:</strong> ₹299 <del style="color:#94a3b8;">₹349</del> &nbsp;|&nbsp; <strong>Prep Time:</strong> 10 mins &nbsp;|&nbsp; <strong>Rating:</strong> 4.9 ★ (98 reviews)
    </p>
    <div style="font-size: 7.8pt; color: #334155; line-height: 1.45;">
      <strong>Core Ingredients:</strong> Hydroponic Baby Spinach, Crisp Tuscan Kale, Thin Cucumber ribbons, Granny Smith Green Apple slices, Roasted Golden Flaxseeds, Fresh Hass Avocado cubes.<br>
      <strong>Dressing:</strong> Freeze-Dried Lemon Cilantro Vinaigrette with extra virgin cold-pressed olive oil.<br>
      <strong>Micronutrients:</strong> Carbs 26g, Fiber 14g, Healthy Fats 12g, Vitamin C 85mg, Iron 3.2mg.
    </div>
  </div>
</div>

<div class="card avoid-break">
  <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 9.5pt;">🥗 Interactive Add-On Upsell Architecture</h4>
  <p style="font-size: 8pt; color: #475569; margin-top: 0;">
    Customers can customize their nutrition by selecting modular add-ons in the drawer. Prices calculate dynamically in the subtotal:
  </p>
  <div class="grid-4" style="font-size: 7.8pt;">
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 7px; border-radius: 6px;">
      <div style="font-weight: 700; color: #1e293b;">Extra Organic Paneer / Tofu</div>
      <div style="color: #16a34a; font-weight: 600;">+₹40 (8g Protein)</div>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 7px; border-radius: 6px;">
      <div style="font-weight: 700; color: #1e293b;">Cold-Blended Dressing Shot</div>
      <div style="color: #16a34a; font-weight: 600;">+₹30 (Pure Herbs)</div>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 7px; border-radius: 6px;">
      <div style="font-weight: 700; color: #1e293b;">Roasted Superfood Seeds Mix</div>
      <div style="color: #16a34a; font-weight: 600;">+₹35 (Omega 3 & 6)</div>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 7px; border-radius: 6px;">
      <div style="font-weight: 700; color: #1e293b;">Fresh Hass Avocado Slices</div>
      <div style="color: #16a34a; font-weight: 600;">+₹50 (Healthy Fats)</div>
    </div>
  </div>
</div>

<div class="card card-highlight avoid-break">
  <h4 style="color: #14532d; margin-bottom: 6px; font-size: 9.5pt;">📍 Surat Hyper-Local Geolocation Validation Hubs</h4>
  <table style="margin-bottom: 0;">
    <thead>
      <tr>
        <th>Hub Location</th>
        <th>Postal Code</th>
        <th>Delivery Radius</th>
        <th>Target SLA</th>
        <th>Kitchen Facility</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Katargam Cloud Hub</strong></td>
        <td>395004</td>
        <td>0 – 7.5 km</td>
        <td>20 – 30 Minutes</td>
        <td>Primary Hydroponic Prep Kitchen #1</td>
      </tr>
      <tr>
        <td><strong>Vesu Express Hub</strong></td>
        <td>395007</td>
        <td>0 – 8.0 km</td>
        <td>25 – 35 Minutes</td>
        <td>Cold-Storage Express Dispatch Unit #2</td>
      </tr>
      <tr>
        <td><strong>Adajan & Pal Satellite</strong></td>
        <td>395009</td>
        <td>0 – 6.0 km</td>
        <td>30 – 35 Minutes</td>
        <td>Satellite Delivery Station</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- PAGE 6: ADMIN OPERATIONS PORTAL & LIVE KITCHEN KANBAN -->
<div class="page-break"></div>

<div class="section-title">
  <span>6. Admin Kitchen Operations Portal (`/admin`)</span>
  <span class="section-number">SECTION 06</span>
</div>

<p style="color: #475569; font-size: 8.5pt; margin-top: 0;">
  The Greesal Admin Portal (`app/admin/page.tsx`) is a comprehensive operational command center built specifically for kitchen supervisors, chefs, and dispatch managers:
</p>

<div class="grid-2 avoid-break">
  <div class="card">
    <h4 style="color: #14532d; margin-bottom: 6px; font-size: 9.5pt;">📊 Live Kitchen Kanban Order Pipeline</h4>
    <ul>
      <li><strong>Real-Time Pipeline Stages:</strong> Orders are organized into clear progressive columns: <em>Placed ➔ Preparing ➔ On the Way ➔ Delivered ➔ Cancelled</em>.</li>
      <li><strong>Order Details Card:</strong> Displays customer name, direct telephone link, delivery address badge, item breakdown, add-ons list, total invoice bill, and elapsed timer.</li>
      <li><strong>1-Tap Status Transition:</strong> Kitchen staff update order stage in real-time with one tap.</li>
      <li><strong>Direct WhatsApp Dispatch:</strong> Generates instant WhatsApp messages to customer or delivery drivers with order tracking info.</li>
      <li><strong>Admin Invoice Generator:</strong> Generates formatted printable invoices directly from the admin panel.</li>
    </ul>
  </div>

  <div class="card">
    <h4 style="color: #14532d; margin-bottom: 6px; font-size: 9.5pt;">🥗 Dynamic Menu & Salad Inventory CMS</h4>
    <ul>
      <li><strong>5-Tab Interactive Salad Editor:</strong>
        <br>• <em>General Tab:</em> Name, price, original strike-through price, badge tag, preparation time, availability toggle.
        <br>• <em>Ingredients Tab:</em> Dynamic array of vegetables, greens, and dressing formula ingredients.
        <br>• <em>Health Benefits Tab:</em> Body advantages, dietary goals, and ideal user profiles.
        <br>• <em>Nutrition Tab:</em> Macro (Protein, Carbs, Fat, Fiber) and Micro (Vitamins A/C/D/E, Sodium, Iron, Potassium).
        <br>• <em>Add-Ons Tab:</em> Upsell items with configurable extra pricing.
      </li>
      <li><strong>Instant Real-time Sync:</strong> Changes instantly update the customer-facing catalog without rebuilding the application.</li>
    </ul>
  </div>
</div>

<div class="grid-2 avoid-break">
  <div class="card">
    <h4 style="color: #0369a1; margin-bottom: 6px; font-size: 9.5pt;">⚙️ Operational Kitchen Schedule & Controls</h4>
    <ul>
      <li><strong>Master Kitchen Open/Closed Toggle:</strong> Emergency stop switch immediately halts new incoming orders when kitchen capacity is reached.</li>
      <li><strong>Daily Operating Hours:</strong> Configurable opening and closing times (e.g. 08:00 AM – 10:30 PM).</li>
      <li><strong>Customer Kitchen Closed Banner:</strong> Custom broadcast message shown when kitchen is offline ("Opening at 08:00 AM. Pre-orders welcome!").</li>
      <li><strong>Delivery Thresholds:</strong> Set minimum order amounts, delivery fees, and free delivery thresholds (default ₹499).</li>
    </ul>
  </div>

  <div class="card">
    <h4 style="color: #0369a1; margin-bottom: 6px; font-size: 9.5pt;">📢 Store Notice Bar & Hero Banner CMS</h4>
    <ul>
      <li><strong>Store Notice Ribbon:</strong> Top banner broadcast with 4 visual styles: <em>Announcement, Discount Offer, Information, Emergency Alert</em>.</li>
      <li><strong>Live Hero Banner Customizer:</strong> Edit hero title, description paragraph, badge text, and USP callout pills directly from the UI.</li>
      <li><strong>Visual Media Manager:</strong> Switch signature salad photography and promotional artwork without touching code.</li>
    </ul>
  </div>
</div>

<!-- PAGE 7: BACKEND REST API & DATABASE SCHEMAS -->
<div class="page-break"></div>

<div class="section-title">
  <span>7. Backend REST API Architecture & Data Models</span>
  <span class="section-number">SECTION 07</span>
</div>

<p style="color: #475569; font-size: 8.5pt; margin-top: 0;">
  The backend service (`backend/`) is powered by asynchronous Python (FastAPI/Flask) and MongoDB with strict Pydantic model validation:
</p>

<div class="card card-highlight avoid-break">
  <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 9.5pt;">📡 Core REST API Endpoint Reference</h4>
  <table style="margin-bottom: 0;">
    <thead>
      <tr>
        <th style="width: 15%;">Method</th>
        <th style="width: 28%;">Endpoint</th>
        <th style="width: 42%;">Description & Payload</th>
        <th style="width: 15%;">Auth Level</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="pill pill-green">GET</span></td>
        <td><code>/api/salads</code></td>
        <td>Fetches all available salads with ingredients, macros, and add-ons.</td>
        <td>Public</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">POST</span></td>
        <td><code>/api/salads</code></td>
        <td>Creates a new salad entry with full nutritional matrices.</td>
        <td>Admin Token</td>
      </tr>
      <tr>
        <td><span class="pill pill-amber">PUT</span></td>
        <td><code>/api/salads/{id}</code></td>
        <td>Updates existing salad fields, pricing, or stock availability.</td>
        <td>Admin Token</td>
      </tr>
      <tr>
        <td><span class="pill pill-green">GET</span></td>
        <td><code>/api/orders</code></td>
        <td>Retrieves order history with filtering by status and customer phone.</td>
        <td>Admin Token</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">POST</span></td>
        <td><code>/api/orders</code></td>
        <td>Places a new customer order with items, delivery address, and notes.</td>
        <td>Public / User</td>
      </tr>
      <tr>
        <td><span class="pill pill-purple">PATCH</span></td>
        <td><code>/api/orders/{id}/status</code></td>
        <td>Transitions order status (Placed ➔ Preparing ➔ On the Way ➔ Delivered).</td>
        <td>Admin Token</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">POST</span></td>
        <td><code>/api/auth/otp/send</code></td>
        <td>Generates and dispatches a 6-digit OTP to user mobile phone/email.</td>
        <td>Rate-Limited</td>
      </tr>
      <tr>
        <td><span class="pill pill-blue">POST</span></td>
        <td><code>/api/auth/otp/verify</code></td>
        <td>Validates OTP code and establishes an authenticated user session.</td>
        <td>Public</td>
      </tr>
      <tr>
        <td><span class="pill pill-green">GET</span></td>
        <td><code>/api/settings</code></td>
        <td>Retrieves store timing, notice ribbons, and hero banner settings.</td>
        <td>Public</td>
      </tr>
      <tr>
        <td><span class="pill pill-green">GET</span></td>
        <td><code>/api/health</code></td>
        <td>Health check validating MongoDB connection and API server status.</td>
        <td>Public</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="grid-2 avoid-break" style="margin-top: 10px;">
  <div class="card">
    <h4 style="color: #0f172a; margin-bottom: 4px; font-size: 8.5pt;">📄 Salad Data Schema (Pydantic / MongoDB)</h4>
    <div class="code-block">
class SaladBase(BaseModel):
    name: str
    slug: Optional[str]
    tag: str = "Chef Choice"
    price: str = "₹299"
    originalPrice: Optional[str] = "₹349"
    calories: str = "410 kcal"
    protein: str = "24g"
    carbs: str = "38g"
    fat: str = "14g"
    image: str
    rating: float = 4.9
    prepTime: str = "10-15 mins"
    isAvailable: bool = True
    isVegetarian: bool = True
    ingredients: List[str]
    healthBenefits: List[str]
    nutrition: Optional[NutritionInfo]
    addOns: List[SaladAddOn]
    </div>
  </div>

  <div class="card">
    <h4 style="color: #0f172a; margin-bottom: 4px; font-size: 8.5pt;">📄 Order Data Schema (Pydantic / MongoDB)</h4>
    <div class="code-block">
class OrderInDB(BaseModel):
    id: str = Field(alias="_id")
    orderNumber: str
    customerName: str
    customerMobile: str
    customerEmail: Optional[str]
    deliveryAddress: str
    deliveryNote: Optional[str]
    items: List[CartItemSchema]
    subtotal: float
    deliveryFee: float
    total: float
    paymentMethod: str
    status: str = "Preparing"
    date: str
    timestamp: int
    </div>
  </div>
</div>

<!-- PAGE 8: REPOSITORY DIRECTORY MAP & DEVELOPER RUNBOOK -->
<div class="page-break"></div>

<div class="section-title">
  <span>8. Project Repository Map & Developer Runbook</span>
  <span class="section-number">SECTION 08</span>
</div>

<p style="color: #475569; font-size: 8.5pt; margin-top: 0;">
  Comprehensive overview of repository structure, environment configuration, and execution workflows:
</p>

<div class="grid-2 avoid-break">
  <div class="card">
    <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 9.5pt;">📁 Repository File Structure Roadmap</h4>
    <table style="margin: 0; font-size: 7.5pt;">
      <tr>
        <th style="width: 35%;">Path / Directory</th>
        <th>Description & Purpose</th>
      </tr>
      <tr>
        <td><code>app/page.tsx</code></td>
        <td>Main customer-facing storefront, hero, catalog, and checkout.</td>
      </tr>
      <tr>
        <td><code>app/admin/page.tsx</code></td>
        <td>Kitchen Kanban, order pipeline, salad CMS & timing controls.</td>
      </tr>
      <tr>
        <td><code>backend/</code></td>
        <td>Python API microservice (FastAPI/Flask, Pydantic, routes).</td>
      </tr>
      <tr>
        <td><code>components/</code></td>
        <td>Modals (Invoice, Login, Profile), Logo, Brand panels, Nav bars.</td>
      </tr>
      <tr>
        <td><code>lib/</code></td>
        <td>MongoDB connection, OTP engine, Rate limiter, WhatsApp helper.</td>
      </tr>
      <tr>
        <td><code>capacitor.config.ts</code></td>
        <td>Capacitor Android configuration for native app bundling.</td>
      </tr>
      <tr>
        <td><code>android/</code></td>
        <td>Native Android Studio Gradle project and manifest.</td>
      </tr>
      <tr>
        <td><code>expo-app/</code></td>
        <td>React Native Expo companion app for mobile testing.</td>
      </tr>
      <tr>
        <td><code>scripts/</code></td>
        <td>Specification PDF generator & in-memory MongoDB starter.</td>
      </tr>
    </table>
  </div>

  <div class="card">
    <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 9.5pt;">🚀 Quick Developer Runbook & Commands</h4>
    <div style="font-size: 8pt; color: #334155;">
      <strong>1. Start Next.js Development Server:</strong>
      <div class="code-block">npm run dev</div>
      Runs responsive frontend at <code>http://localhost:3000</code>.
      <br><br>
      <strong>2. Start Python Backend API:</strong>
      <div class="code-block">python backend/run.py</div>
      Runs async REST API at <code>http://localhost:8000</code>.
      <br><br>
      <strong>3. Run Local Development MongoDB:</strong>
      <div class="code-block">node scripts/start-mongo.js</div>
      Launches local in-memory database instance.
      <br><br>
      <strong>4. Sync & Launch Capacitor Android:</strong>
      <div class="code-block">npm run cap:sync && npm run cap:open</div>
      Compiles web assets into native Android Studio environment.
      <br><br>
      <strong>5. Launch Expo React Native Companion:</strong>
      <div class="code-block">npm run expo</div>
      Opens Expo CLI with QR code for physical device testing.
    </div>
  </div>
</div>

<div class="section-title">
  <span>9. UI Designer Handover Checklist & Expectations</span>
  <span class="section-number">SECTION 09</span>
</div>

<div class="card card-highlight avoid-break">
  <table style="margin-bottom: 0;">
    <thead>
      <tr>
        <th style="width: 25%;">Deliverable</th>
        <th style="width: 45%;">Requirements & Formats</th>
        <th style="width: 30%;">Status / Target</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Figma Design System</strong></td>
        <td>Components, Auto-Layout v5, Color Styles, Typography scales, 8pt Grid spacing tokens, Lucide icon set.</td>
        <td><span class="pill pill-green">Mandatory</span></td>
      </tr>
      <tr>
        <td><strong>Desktop Artboards (1440px)</strong></td>
        <td>Landing page, Catalog menu, Detail drawer, Cart drawer, Invoice view, Admin management portal.</td>
        <td><span class="pill pill-green">Mandatory</span></td>
      </tr>
      <tr>
        <td><strong>Mobile App Artboards (390px)</strong></td>
        <td>iOS & Android safe-area compliant screens with floating bottom navigation and bottom sheet drawers.</td>
        <td><span class="pill pill-green">Mandatory</span></td>
      </tr>
      <tr>
        <td><strong>Interactive Prototype</strong></td>
        <td>Figma interactive prototype demonstrating: Add-to-cart bounce, Drawer slide-in, Category switch, and Checkout flow.</td>
        <td><span class="pill pill-amber">High Priority</span></td>
      </tr>
      <tr>
        <td><strong>Asset Export Pack</strong></td>
        <td>SVGs of all custom icons, leaf motifs, transparent salad bowl PNGs, and app splash screen assets.</td>
        <td><span class="pill pill-blue">Included</span></td>
      </tr>
    </tbody>
  </table>
</div>

<div class="callout avoid-break" style="margin-top: 10px;">
  <div class="callout-title">🌿 Greesal Guiding Principle</div>
  "Every screen should make the user feel healthy, energized, and hungry for fresh green food. The layout must feel effortless, fast, and transparent."
</div>

<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 7.5pt; color: #64748b;">
  <div><strong>Greesal Healthy Living Private Limited</strong> • Surat, Gujarat, India</div>
  <div>contact@greesal.in • +91 98251 44321</div>
</div>

</body>
</html>
"""

# Write HTML file
with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Generated HTML specification: {OUTPUT_HTML}")

# Compile PDF using Headless Chrome or Edge
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

print(f"Using browser at: {chrome_path}")

cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={TEMP_PDF}",
    OUTPUT_HTML
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Browser output:", res.stdout, res.stderr)

if os.path.exists(TEMP_PDF):
    shutil.copyfile(TEMP_PDF, OUTPUT_PDF)
    print(f"Successfully generated PDF: {OUTPUT_PDF} ({os.path.getsize(OUTPUT_PDF)//1024} KB)")
else:
    print("Temp PDF was not created.")

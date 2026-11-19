# N5 Apparels — Official Online Storefront & Owner Admin Portal

A luxury Apple-inspired online clothing store designed for **N5 Apparels** (Akbar Plaza, Malakpet, Hyderabad). Built with a warm ivory and gold aesthetic, real interactive GPS mapping, dynamic UPI QR checkout, real-time order status tracking, and a zero-code admin portal designed specifically for the shop owner to upload stock and manage deliveries effortlessly.

---

## 🌟 Key Highlights & Architecture

### 1. 🛍️ Storefront Navigation & Categories
* **White & Ivory Luxury Theme**: Clean Apple-style design with soft shadows, gold accents (`#c5a869`), elegant `Playfair Display` serif typography, and dark accents.
* **Navigation Tabs**:
  * **Home**: Hero banner (*"Original Brands. Honest Prices."*), *Shop by Category* (Shirts, T-Shirts, Jeans), *Visit Our Store* physical store showcase with real inside and outside photos and opening hours, *Trending New Drops*, and trust pillars.
  * **Clothes**: Features a dropdown arrow (`▾`) showing categories: **All, Shirts, T-Shirts, Jeans**. Clicking "Clothes" displays the full catalog, while selecting a category filters it instantly.
  * **Orders**: Real-time order tracking with a 5-step timeline: `Placed` ➔ `Confirmed` ➔ `Packed` ➔ `Shipped` ➔ `Delivered`, plus an *"Ask about this order on WhatsApp"* button.
  * **Contact**:
    1. **Real Interactive Map**: Embedded OpenStreetMap/Leaflet GPS map pinned at Akbar Plaza, Malakpet, Hyderabad with custom N5 gold logo marker and direct Google Maps navigation link.
    2. **6-Photo Real Store Showcase**: High-resolution polished interior & exterior photographs (Storefront Night View with N5 Standee, Entrance with Mannequins, Inside Double-Deck Racks, Inside Premium Denim Shelves, Inside Boutique Aisle, Inside Cashier Counter).
    3. **Horizontal Action Row**: Instant redirection buttons for **WhatsApp** (`wa.me/919700663930`), **Phone Call** (`tel:+919700663930`), and **Instagram** (`instagram.com/n5_apparels`).
    4. **Ask a Query Form**: Allows customers to submit inquiries (Name, Phone, Topic, Message), logging them into the admin dashboard while offering instant WhatsApp resolution.
    5. **Horizontal 3-Column Footer (No Tab Section)**:
       - **Left**: Store Address & Landmarks (Akbar Plaza, Beside Kolhapuri Footwear, Malakpet, Hyderabad).
       - **Center**: Official 3D Metallic Circular N5 Logo & Brand Title.
       - **Right**: "Open Daily till 11:00 PM" badge on top, below it Contact (`+91 9700663930`), below it WhatsApp, below it Instagram.
       - **Bottom**: All Rights Reserved copyright line with discreet owner portal access. (Tab navigation line completely removed).

---

### 2. 💳 Dynamic UPI QR Code & Instant Mobile Checkout
* Dynamic NPCI-compliant UPI QR codes generated for every order with the exact payable amount.
* Supported by all Indian payment apps: **Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay**.
* Includes **"Open UPI App"** deep links for mobile devices and a **"Copy UPI ID"** button.
* Simulates email tax invoice dispatch to customer's email and provides a one-tap WhatsApp alert to notify the shop owner about incoming orders.

---

### 3. 🛡️ User Authentication & OTP Verification
* Customer registration with Full Name, Email, Phone Number, and Password.
* Realistic SMS OTP verification screen with an **Auto-fill** feature.
* Seamless login using **Email OR Mobile Number + Password**.
* Persistent customer profile drawer with saved addresses and past orders.

---

### 4. 👑 Shop Owner Admin Portal (`#admin`)
* Accessible via the footer **"Owner Login"** or by appending `#admin` to the URL.
* Default PIN: **`1234`** (Customizable in Settings).
* **Super-Simple Stock Listing**:
  * **Step 1**: Pick photo from phone/computer (auto-resizes and previews).
  * **Step 2**: Type product title (e.g. *Acid Wash Oversized Tee*).
  * **Step 3**: Select category (*Shirts, T-Shirts, Jeans, Jackets*).
  * **Step 4**: Enter price & MRP.
  * **Step 5**: Check available sizes (S, M, L, XL, XXL, 30, 32, etc.).
  * **Step 6**: Add fabric details and tap **"Publish Product Live"**.
* **Order Management & Delivery Tracking**:
  * View customer orders with name, phone, address, items, and payment reference.
  * 1-click order status update: `Placed` ➔ `Confirmed` ➔ `Packed` ➔ `Shipped` ➔ `Delivered`.
  * **"Send WhatsApp Update"**: Generates a pre-formatted WhatsApp message to the customer with their order tracking update with one tap!
* **Customer Queries Dashboard**:
  * Review all customer inquiries submitted on the site.
  * One-click *"Reply on WhatsApp"* to directly open a chat with the customer.

---

## 🚀 How to Run the Website Locally

You can run the site in two ways:

### Option A: Using the Built-In Node.js Server (Recommended)
From the project folder `C:\Users\syeda\.gemini\antigravity\scratch\n5-apparels`, run:
```powershell
node server.js
```
Then open your browser to:
* **Storefront**: [http://localhost:3000](http://localhost:3000)
* **Owner Admin Panel**: [http://localhost:3000#admin](http://localhost:3000#admin) *(PIN: 1234)*

### Option B: Open Directly in Any Browser
Double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox without any installation.

---

## 🌐 Free 1-Click Deployment (Vercel / Netlify / GitHub Pages)

The project is structured as a zero-dependency modern web application and can be hosted online for free in under 2 minutes:
1. **Vercel**: Drag and drop the `n5-apparels` folder onto [vercel.com](https://vercel.com).
2. **Netlify**: Drag and drop the folder into [netlify.com/drop](https://app.netlify.com/drop).
3. **GitHub Pages**: Push this directory to a repository and enable GitHub Pages in Settings.

---

## 📍 Store Reference Details
* **Shop Name**: N5 Apparels
* **Address**: Akbar Plaza, Beside Kolhapuri Footwear, Malakpet, Hyderabad - 500036
* **Landmarks**: Near Malakpet Metro & Railway Station, Hotel Sohail & Peshawar Restaurant
* **Phone / WhatsApp**: +91 9700663930
* **Instagram**: [@n5_apparels](https://instagram.com/n5_apparels)
* **Timings**: Open Daily 11:00 AM – 11:00 PM

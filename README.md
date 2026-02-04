# Cultura Frontend

โปรเจกต์นี้เป็นส่วน Frontend สำหรับแอปพลิเคชัน **Cultura** ซึ่งพัฒนาโดยใช้เทคโนโลยี **React**, **TypeScript**, และ **Vite** พร้อมทั้งใช้งาน **Tailwind CSS** สำหรับการตกแต่งหน้าตาเว็บไซต์

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
cultura-frontend/
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── eslint.config.js     # ESLint configuration
├── index.html           # Main HTML entry point
├── package.json         # Project dependencies and scripts
├── src/                 # Source code directory
│   ├── App.tsx         # Main App component
│   ├── index.css       # Global styles (Tailwind imports)
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite type definitions
├── tsconfig.app.json    # TypeScript config for App
├── tsconfig.json        # Base TypeScript config
├── tsconfig.node.json   # TypeScript config for Node
└── vite.config.ts       # Vite configuration
```

## 📋 สิ่งที่ต้องมีเบื้องต้น (Prerequisites)

- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน LTS ล่าสุด)
- npm (ติดตั้งมาพร้อมกับ Node.js)

## 🚀 การติดตั้ง (Installation)

1. Clone โปรเจกต์ลงมาที่เครื่องของคุณ:

   ```bash
   git clone https://github.com/Team2-Tralalero-Tralala/cultura-frontend
   cd cultura-frontend
   ```

2. ติดตั้ง Dependencies ต่าง ๆ:
   ```bash
   npm install
   ```

## ⚙️ การตั้งค่า (Configuration)

ก่อนเริ่มใช้งาน ให้ทำการสร้างไฟล์ `.env` ที่ root directory ของโปรเจกต์ และกำหนดค่าต่าง ๆ ดังนี้:

```env
VITE_API_URL=http://localhost:3000/api
VITE_PORT=4000
```

| ตัวแปร         | รายละเอียด                                   |
| :------------- | :------------------------------------------- |
| `VITE_API_URL` | URL ของ Backend API ที่ Frontend จะเชื่อมต่อ |
| `VITE_PORT`    | Port ที่ต้องการให้ Frontend รัน (เช่น 4000)  |

## 🛠️ สำหรับนักพัฒนา (For Developers)

คำสั่งต่าง ๆ ที่สามารถใช้ได้ในโปรเจกต์นี้:

### รันโปรเจกต์ (Development Mode)

สำหรับรันเพื่อพัฒนา (Development Server):

```bash
npm run dev
```

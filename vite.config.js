import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Yerel geliştirmede /api isteklerini `vercel dev` çalıştırdığınızda otomatik
// olarak api/ klasöründeki fonksiyonlara yönlendirir. Sadece `vite` ile
// çalıştırırsanız (vercel dev olmadan) /api rotaları çalışmaz — bu yüzden
// yerel test için `npm i -g vercel && vercel dev` kullanmanız önerilir.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});

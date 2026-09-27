import {defineConfig} from 'vite';
export default defineConfig({base:process.env.VITE_DEMO==='true'?'/Notion-Job-Application-Analytics/':'/'});

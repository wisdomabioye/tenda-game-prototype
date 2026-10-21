import {defineConfig} from 'vite';
import {buildGraph} from './scripts/buildGraph';
import {buildPwa} from './scripts/pwaBuild';
export default defineConfig(({mode})=>{
 const standalone=mode==='standalone';
 return {base:'./',plugins:standalone?[]:[buildGraph(),buildPwa()],build:{
  outDir:standalone?'dist-standalone':'dist',target:'es2022',
  assetsInlineLimit:4096,cssCodeSplit:!standalone,manifest:!standalone,
  rollupOptions:{output:{
   inlineDynamicImports:standalone,
   entryFileNames:standalone?'app.js':'assets/[name]-[hash].js',
   chunkFileNames:'assets/[name]-[hash].js',
   assetFileNames:standalone?'[name][extname]':'assets/[name]-[hash][extname]',
   // Keep the stable UI runtime cacheable; let Rollup share renderer dependencies naturally.
   manualChunks:standalone?undefined:(id:string)=>/node_modules\/(react|react-dom|scheduler)\//.test(id)?'react-runtime':undefined,
  }},
 }};
});

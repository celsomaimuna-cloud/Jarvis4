import React from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, LayoutTemplate } from 'lucide-react';

export function CanvasPanel() {
  return (
    <div className="h-full w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 relative">
      {/* Canvas Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-sm">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
         {/* Decorative Grid */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] pointer-events-none"></div>

         <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="relative z-10"
         >
           <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
             <LayoutTemplate className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
           </div>
           <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">Jarvis Canvas</h2>
           <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed text-sm">
             Visual workspace for generated interfaces and components. Start prompting to build.
           </p>
         </motion.div>
      </div>
    </div>
  );
}

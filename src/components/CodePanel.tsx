import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme for Prism

export function CodePanel() {
  const [code, setCode] = useState(
    `function Jarvis() {\n  console.log("Hello Playbox 2026!");\n}\n`
  );

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 font-medium tracking-wide">src/components/Main.tsx</span>
        <div className="flex gap-1.5 opacity-50">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-400"></div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => Prism.highlight(code, Prism.languages.typescript, 'typescript')}
          padding={10}
          className="font-mono text-sm min-h-full outline-none"
          style={{
            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
            backgroundColor: 'transparent',
            color: '#d4d4d4',
          }}
        />
      </div>
    </div>
  );
}

export default function ConsolePanel({ output }) {
  return (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-800 p-2 flex flex-col">
      <h2 className="text-green-500 mb-1 font-semibold text-sm">Output</h2>
      <div className="flex-grow bg-black text-white p-3 overflow-y-auto font-mono text-sm rounded">
        <pre>{output}</pre>
      </div>
    </div>
  );
}

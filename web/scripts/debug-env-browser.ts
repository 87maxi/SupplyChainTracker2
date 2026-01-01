// Debug script for browser environment

console.log('Debug script loaded in browser');

export default function DebugEnv() {
  return (
    <div>
      <h1>Environment Variables</h1>
      <pre>{JSON.stringify(window.location, null, 2)}</pre>
      <h2>Environment from process.env</h2>
      <pre>{JSON.stringify(process.env, null, 2)}</pre>
    </div>
  );
}
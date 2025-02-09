export default function Settings() {
  return (
    <div className="w-full h-full pt-4 flex flex-col space-y-2">
      <p className="px-4 text-sm">Settings</p>
      <div className="flex flex-col space-y-2 px-4">
        <label htmlFor="exclude-input" className="text-sm">
          Exclude files (i.e. .ts, nodemodules, .js)
        </label>
        <input
          name="exclude-input"
          className="border bg-background text-foreground placeholder:text-foreground border-accent focus:rounded-none px-1"
        />
      </div>
    </div>
  );
}

/**
 * Show directory structure
 * Show number of tokens
 * Copy button
 * @returns Toolbar
 */

/**
 * TODO
 * Change to icons
 * Make it draggable
 */
export default function Toolbar() {
  return (
    <div className="fixed bottom-8 right-8">
      <div className="flex flex-row gap-4 p-2 bg-zinc-200 rounded-md justify-center">
        <button type="button" className="px-2 py-1 bg-red-200">
          T
        </button>
        <button type="button" className="px-2 py-1">
          D
        </button>
        <button type="button" className="px-2 py-1">
          I
        </button>
        <button type="button" className="px-2 py-1">
          C
        </button>
      </div>
    </div>
  );
}

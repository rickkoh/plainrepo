import { useFileContext } from '../../contexts/FileContext';

export default function TabsContentArea() {
  // Retrieve the content based on the current fileContext
  const { content } = useFileContext();

  return (
    <div className="w-full h-full p-8 py-2 overflow-scroll">
      <pre className="whitespace-pre-wrap">{content}</pre>
    </div>
  );
}

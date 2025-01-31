// import { Input } from '@/components/ui/input';
// import { useState, ChangeEvent } from 'react';
import { useFileContext } from '../contexts/FileContext';

export default function Viewer() {
  const { content } = useFileContext();
  // const [searchString, setSearchString] = useState('');

  // const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setSearchString(event.target.value);
  // };

  return (
    <div className="w-full h-full p-8 overflow-scroll">
      <div className="fixed top-10 right-10 w-64">
        {/* <Input
          value={searchString}
          onChange={handleSearchChange}
          placeholder="Type to search and scroll..."
          className="w-full"
        /> */}
      </div>
      <pre className="whitespace-pre-wrap">{content}</pre>
    </div>
  );
}

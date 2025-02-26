const fs = require('fs');
const path = require('path');

// Configuration
const TOTAL_SIZE_MB = 64; // Total size in MB
const BYTES_PER_MB = 1024 * 1024;
const TOTAL_SIZE_BYTES = TOTAL_SIZE_MB * BYTES_PER_MB;
const MAX_DEPTH = 3; // Maximum directory nesting level (0-based, so this means 4 levels total)
const MIN_FILE_SIZE_BYTES = 100; // Allow very small files (100 bytes)
const MAX_FILE_SIZE_MB = 4; // Maximum file size in MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * BYTES_PER_MB;
const CHUNK_SIZE = 1 * BYTES_PER_MB; // Write in 1MB chunks to save memory
const TARGET_FILE_COUNT = 800; // Target to create about 800 files

// Tracking variables
let totalBytesCreated = 0;
let totalFilesCreated = 0;
let totalDirsCreated = 0;

// Calculate the average file size (but we'll use a distribution around this average)
const AVG_FILE_SIZE_BYTES = Math.floor(TOTAL_SIZE_BYTES / TARGET_FILE_COUNT);

// Generate lorem ipsum paragraph
function generateLoremIpsumParagraph() {
  const words = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
    "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
    "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
    "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
    "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
    "est", "laborum"
  ];

  // Generate a paragraph with 3-6 sentences
  const numSentences = Math.floor(Math.random() * 4) + 3;
  let paragraph = '';

  for (let s = 0; s < numSentences; s++) {
    // Each sentence has 6-15 words
    const sentenceLength = Math.floor(Math.random() * 10) + 6;
    let sentence = '';

    for (let w = 0; w < sentenceLength; w++) {
      sentence += words[Math.floor(Math.random() * words.length)];
      sentence += (w < sentenceLength - 1) ? ' ' : '';
    }

    // Capitalize first letter of the sentence
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);

    // Add period and space after each sentence
    paragraph += sentence + '. ';
  }

  return paragraph;
}

// Create a chunk of lorem ipsum text of specified size
function createTextChunk(size) {
  let chunk = '';
  while (chunk.length < size) {
    chunk += generateLoremIpsumParagraph() + '\n\n';
  }
  return chunk.substring(0, size);
}

// Create directory if it doesn't exist
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    totalDirsCreated++;
    console.log(`Created directory: ${dirPath}`);
  }
}

// Generate a random number between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get a random file size based on our distribution strategy
function getRandomFileSize() {
  // We'll use a distribution where:
  // - 50% of files are very small (between MIN_FILE_SIZE_BYTES and AVG_FILE_SIZE_BYTES/4)
  // - 30% of files are medium (between AVG_FILE_SIZE_BYTES/4 and AVG_FILE_SIZE_BYTES)
  // - 15% of files are large (between AVG_FILE_SIZE_BYTES and AVG_FILE_SIZE_BYTES*2)
  // - 5% of files are very large (between AVG_FILE_SIZE_BYTES*2 and MAX_FILE_SIZE_BYTES)

  const rand = Math.random() * 100;
  let size;

  if (rand < 50) {
    // Very small files
    size = getRandomInt(MIN_FILE_SIZE_BYTES, Math.floor(AVG_FILE_SIZE_BYTES / 4));
  } else if (rand < 80) {
    // Medium files
    size = getRandomInt(Math.floor(AVG_FILE_SIZE_BYTES / 4), AVG_FILE_SIZE_BYTES);
  } else if (rand < 95) {
    // Large files
    size = getRandomInt(AVG_FILE_SIZE_BYTES, Math.floor(AVG_FILE_SIZE_BYTES * 2));
  } else {
    // Very large files
    size = getRandomInt(Math.floor(AVG_FILE_SIZE_BYTES * 2), MAX_FILE_SIZE_BYTES);
  }

  return size;
}

// Calculate how many more files we can create to hit target
function getRemainingFileCount() {
  return TARGET_FILE_COUNT - totalFilesCreated;
}

// Calculate how many more bytes we can create to hit target
function getRemainingBytes() {
  return TOTAL_SIZE_BYTES - totalBytesCreated;
}

// Write a file in chunks to avoid memory issues
async function writeFileInChunks(filePath, totalBytes) {
  return new Promise((resolve, reject) => {
    try {
      // Create or truncate the file
      const fileStream = fs.createWriteStream(filePath);

      let remainingBytes = totalBytes;
      let bytesWritten = 0;

      const writeNextChunk = () => {
        if (remainingBytes <= 0) {
          fileStream.end();
          totalBytesCreated += bytesWritten;
          totalFilesCreated++;

          const sizeInKB = bytesWritten >= 1024 ?
            `${(bytesWritten / 1024).toFixed(2)}KB` :
            `${bytesWritten} bytes`;

          console.log(`Created ${path.basename(filePath)} in ${path.dirname(filePath)} (${sizeInKB})`);
          resolve();
          return;
        }

        const chunkSize = Math.min(remainingBytes, CHUNK_SIZE);
        const chunk = createTextChunk(chunkSize);

        // Write the chunk
        const canContinue = fileStream.write(chunk);
        bytesWritten += chunk.length;
        remainingBytes -= chunk.length;

        if (canContinue) {
          writeNextChunk();
        } else {
          fileStream.once('drain', writeNextChunk);
        }
      };

      // Start writing chunks
      writeNextChunk();
    } catch (err) {
      reject(err);
    }
  });
}

// Create files in a directory
async function createFilesInDirectory(dirPath, numFiles) {
  const filePromises = [];
  const remainingBytes = getRemainingBytes();
  const remainingFiles = getRemainingFileCount();

  // Don't create more files than we have remaining in our target
  const actualNumFiles = Math.min(numFiles, remainingFiles);

  // Skip if we've reached our limits
  if (actualNumFiles <= 0 || remainingBytes <= 0) {
    return;
  }

  // Calculate an adjusted average size for these files
  const adjustedAvgBytes = Math.floor(remainingBytes / remainingFiles);

  for (let i = 0; i < actualNumFiles; i++) {
    const fileName = `file_${totalFilesCreated}_${i + 1}.txt`;
    const filePath = path.join(dirPath, fileName);

    // Get a random file size, but make sure we don't exceed our remaining bytes
    let fileSize = getRandomFileSize();

    // Make sure we don't create a file larger than what we have left
    fileSize = Math.min(fileSize, remainingBytes);

    // If we're getting close to our limit, adjust to ensure we hit our targets
    const isLastBatch = (remainingFiles - i) < 10;
    if (isLastBatch) {
      // Distribute remaining bytes evenly among remaining files
      fileSize = Math.floor(remainingBytes / (remainingFiles - i));
    }

    // Ensure minimum file size
    fileSize = Math.max(MIN_FILE_SIZE_BYTES, fileSize);

    // Write file in chunks
    filePromises.push(writeFileInChunks(filePath, fileSize));
  }

  // Wait for all files in this directory to be written
  await Promise.all(filePromises);
}

// Process a directory level, creating both files and subdirectories
async function processDirectory(baseDir, depth = 0) {
  // Create this directory
  createDirectoryIfNotExists(baseDir);

  // Create files in this directory (more at lower depths)
  const filesAtThisLevel = getRandomInt(5, 20 - depth * 3);
  await createFilesInDirectory(baseDir, filesAtThisLevel);

  // Stop if we've reached our target file count or size
  if (totalFilesCreated >= TARGET_FILE_COUNT || totalBytesCreated >= TOTAL_SIZE_BYTES) {
    return;
  }

  // Create subdirectories (if not at max depth)
  if (depth < MAX_DEPTH) {
    // Create more subdirectories at shallow depths, fewer at deeper levels
    const numSubdirs = getRandomInt(2, 6 - depth);

    for (let i = 0; i < numSubdirs; i++) {
      const dirName = `dir_${depth + 1}_${i + 1}`;
      const dirPath = path.join(baseDir, dirName);

      // Stop if we've reached our target file count or size
      if (totalFilesCreated >= TARGET_FILE_COUNT || totalBytesCreated >= TOTAL_SIZE_BYTES) {
        break;
      }

      // Recursively process this subdirectory
      await processDirectory(dirPath, depth + 1);
    }
  }
}

// Main function to create the directory structure
async function createRandomDirectoryStructure() {
  // Create the root directory
  const rootDir = path.join(process.cwd(), 'random_tree_root');
  console.log(`Starting creation of directories and files...`);
  console.log(`Target: ${TARGET_FILE_COUNT} files totaling ${TOTAL_SIZE_MB}MB`);
  console.log(`Average file size: ${(AVG_FILE_SIZE_BYTES / 1024).toFixed(2)}KB`);

  // Process the directory structure
  await processDirectory(rootDir);

  // Calculate actual average file size
  const actualAvgSize = totalFilesCreated > 0 ? totalBytesCreated / totalFilesCreated : 0;

  console.log(`\nFile and directory creation completed!`);
  console.log(`Target file count: ${TARGET_FILE_COUNT}`);
  console.log(`Actual files created: ${totalFilesCreated}`);
  console.log(`Total directories created: ${totalDirsCreated}`);
  console.log(`Target size: ${TOTAL_SIZE_MB}MB`);
  console.log(`Actual size: ${(totalBytesCreated / BYTES_PER_MB).toFixed(2)}MB`);
  console.log(`Average file size: ${(actualAvgSize / 1024).toFixed(2)}KB`);
}

// Run the script
createRandomDirectoryStructure().catch(err => console.error('Error:', err));

import { FileNode } from '../types/FileNode';

const testFileNode: FileNode = {
  name: 'src',
  path: '/src',
  type: 'directory',
  selected: false,
  children: [
    {
      name: 'renderer',
      path: '/src/renderer',
      type: 'directory',
      selected: false,
    },
    {
      name: 'main',
      path: '/src/main',
      type: 'directory',
      selected: false,
      children: [
        {
          name: 'index.ts',
          path: '/src/main/index.ts',
          type: 'file',
          selected: false,
        },
      ],
    },
    {
      name: 'app.tsx',
      path: '/src/app.tsx',
      type: 'file',
      selected: false,
    },
    {
      name: 'src',
      path: '/src',
      type: 'directory',
      selected: false,
      children: [
        {
          name: 'renderer',
          path: '/src/renderer',
          type: 'directory',
          selected: false,
          children: [
            {
              name: 'renderer',
              path: '/src/renderer',
              type: 'directory',
              selected: false,
              children: [
                {
                  name: 'renderer',
                  path: '/src/renderer',
                  type: 'directory',
                  selected: false,
                  children: [
                    {
                      name: 'toolbar.tsx',
                      path: '/src/renderer/toolbar.tsx',
                      type: 'file',
                      selected: false,
                    },
                  ],
                },
                {
                  name: 'main',
                  path: '/src/main',
                  type: 'directory',
                  selected: false,
                  children: [
                    {
                      name: 'index.ts',
                      path: '/src/main/index.ts',
                      type: 'file',
                      selected: false,
                    },
                  ],
                },
                {
                  name: 'app.tsx',
                  path: '/src/app.tsx',
                  type: 'file',
                  selected: false,
                },
              ],
            },
            {
              name: 'main',
              path: '/src/main',
              type: 'directory',
              selected: false,
              children: [
                {
                  name: 'index.ts',
                  path: '/src/main/index.ts',
                  type: 'file',
                  selected: false,
                },
              ],
            },
            {
              name: 'app.tsx',
              path: '/src/app.tsx',
              type: 'file',
              selected: false,
            },
          ],
        },
        {
          name: 'main',
          path: '/src/main',
          type: 'directory',
          selected: false,
          children: [
            {
              name: 'index.ts',
              path: '/src/main/index.ts',
              type: 'file',
              selected: false,
            },
          ],
        },
        {
          name: 'app.tsx',
          path: '/src/app.tsx',
          type: 'file',
          selected: false,
        },
      ],
    },
  ],
};

export default testFileNode;

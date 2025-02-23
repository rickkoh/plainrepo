Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      sendMessage: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      once: jest.fn(),
      readUserData: jest.fn().mockResolvedValue({}),
      selectFolder: jest.fn().mockResolvedValue('/fake/path'),
      getContent: jest.fn().mockResolvedValue('fake content'),
      getTokenCount: jest.fn().mockResolvedValue('0'),
      toFileContentNode: jest.fn().mockResolvedValue({}),
      saveWorkspace: jest.fn().mockResolvedValue(undefined),
      loadWorkspace: jest.fn().mockResolvedValue([]),
      updateAppSettings: jest.fn().mockResolvedValue({ success: true }),
    },
  },
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

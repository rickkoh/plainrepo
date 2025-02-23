import { render, waitFor } from '@testing-library/react';
import App from '../renderer/App';

describe('App', () => {
  it('should render', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('main')).toBeTruthy();
    });
  });
});

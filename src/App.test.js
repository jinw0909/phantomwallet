import { render, screen } from '@testing-library/react';
import DesktopApp from './DesktopApp';

test('renders learn react link', () => {
  render(<DesktopApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

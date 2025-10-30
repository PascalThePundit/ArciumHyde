import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  test('renders the button with children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
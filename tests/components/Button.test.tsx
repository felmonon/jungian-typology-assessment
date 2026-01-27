import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('renders with primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('from-amber-600');
    expect(button).toHaveClass('to-amber-700');
    expect(button).toHaveClass('text-white');
  });

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('bg-transparent');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-jung-dark');
    expect(button).toHaveClass('text-white');
  });

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent');
    expect(button).toHaveClass('text-jung-dark');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-8');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('renders children correctly', () => {
    render(
      <Button>
        <span data-testid="icon">Icon</span>
        Text
      </Button>
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Text');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('renders with left and right icons', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">L</span>} rightIcon={<span data-testid="right-icon">R</span>}>
        Text
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});

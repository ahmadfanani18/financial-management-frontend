import { render, screen } from '@testing-library/react';
import { CountdownTimer } from '../countdown-timer';

describe('CountdownTimer', () => {
  it('displays time in MM:SS format', () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    render(<CountdownTimer expiredAt={futureDate} onExpire={() => {}} />);
    expect(screen.getByText(/0[4-5]:\d{2}/)).toBeInTheDocument();
  });
});
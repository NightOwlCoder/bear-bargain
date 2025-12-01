import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';
import TradeConfirmModal from '../src/components/TradeConfirmModal';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  const LinearGradient = ({ children, ...props }: any) => <View {...props}>{children}</View>;
  return { __esModule: true, LinearGradient, default: LinearGradient };
});

jest.mock('../src/hooks/usePortfolio', () => ({
  usePortfolio: () => ({
    recommendedAmount: 1250,
    recommendedShares: 15,
    portfolioImpactPercent: 2.5,
    baseHolding: { avgPrice: 88 },
    newDollarCostAverage: 84,
  }),
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Heavy: 'heavy' },
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
  },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

describe('TradeConfirmModal', () => {
  const requiredProps = {
    symbol: 'IBIT',
    price: 90,
    dipPercentage: 12.5,
    onClose: jest.fn(),
  };

  const renderModal = (onConfirm = jest.fn(() => Promise.resolve())) => {
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <TradeConfirmModal
          {...requiredProps}
          onConfirm={onConfirm}
        />,
      );
    });
    return tree!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables actions while executing and prevents duplicate submissions', async () => {
    let resolveConfirm: () => void;
    const confirmPromise = new Promise<void>((resolve) => {
      resolveConfirm = resolve;
    });
    const onConfirm = jest.fn(() => confirmPromise);

    const tree = renderModal(onConfirm);
    const buyButton = tree.root.findByProps({ testID: 'trade-confirm-buy' });
    const laterButton = tree.root.findByProps({ testID: 'trade-confirm-close' });

    let pressPromise: Promise<void> | undefined;

    await act(async () => {
      pressPromise = buyButton.props.onPress();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(buyButton.props.disabled).toBe(true);
    expect(laterButton?.props.disabled).toBe(true);

    await act(async () => {
      buyButton.props.onPress();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveConfirm();
      await confirmPromise;
    });

    await act(async () => {
      await pressPromise;
    });

    await act(async () => {
      await Promise.resolve();
    });

    const updatedBuyButton = tree.root.findByProps({ testID: 'trade-confirm-buy' });
    expect(updatedBuyButton.props.disabled).toBe(false);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
  });

  it('avoids state updates after unmount', async () => {
    let resolveConfirm: () => void;
    const confirmPromise = new Promise<void>((resolve) => {
      resolveConfirm = resolve;
    });

    const onConfirm = jest.fn(() => confirmPromise);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const tree = renderModal(onConfirm);
    const buyButton = tree.root.findByProps({ accessibilityLabel: 'Execute mock buy now' });

    await act(async () => {
      buyButton.props.onPress();
    });

    await act(async () => {
      tree.unmount();
    });

    await act(async () => {
      resolveConfirm();
      await confirmPromise;
    });

    expect(Haptics.notificationAsync).not.toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

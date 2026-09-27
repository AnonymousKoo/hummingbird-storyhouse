import type { Money } from 'hummingbird-storyhouse-core';

export const money = (value: Money): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: value.currency, maximumFractionDigits: 0 }).format(value.amount / 100);
export const date = (value: string): string => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
export const dateTime = (value: string): string => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
export const percent = (value: number): string => new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 }).format(value);
export const label = (value: string): string => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

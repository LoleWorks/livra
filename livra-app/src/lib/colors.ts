export const colors = {
  orange: '#ff5c2c',
  black: '#161513',
  cream: '#f4f3ef',
  white: '#ffffff',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray700: '#404040',
  gray900: '#171717',
  emerald: '#10b981',
  red: '#ef4444',
  violet: '#7c3aed',
  amber: '#f59e0b',
}

export const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: '#fef3c7', text: '#92400e', label: 'În așteptare' },
  dispatched: { bg: '#ede9fe', text: '#5b21b6', label: 'Preluat' },
  en_route:   { bg: '#dbeafe', text: '#1e40af', label: 'În drum' },
  nearby:     { bg: '#ffedd5', text: '#9a3412', label: 'Aproape!' },
  delivered:  { bg: '#d1fae5', text: '#065f46', label: 'Livrat' },
  failed:     { bg: '#fee2e2', text: '#991b1b', label: 'Eșuat' },
}

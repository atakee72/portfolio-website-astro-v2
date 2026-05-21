export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'home', href: '/#home' },
  { label: 'sheet', href: '/#sheet' },
  { label: 'work', href: '/#work' },
  { label: 'journal', href: '/#blog' },
  { label: 'rolls', href: '/lens' },
  { label: 'paints', href: '/paints' },
  { label: 'reach', href: '/#reach-form' },
];

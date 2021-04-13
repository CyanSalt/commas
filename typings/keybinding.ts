export interface KeyBinding {
  label: string,
  accelerator: string,
  when?: 'keydown' | 'keyup',
  command?: string,
  args?: any[],
  submenu?: KeyBinding[],
}

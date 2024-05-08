import type { TerminalTab } from '../../typings/terminal'

export interface DraggableTabData {
  type: 'tab',
  index: number,
  create?: () => TerminalTab | Promise<TerminalTab>,
  dispose?: () => void,
}

export interface DraggableElementData extends Partial<Omit<DraggableTabData, 'type'>> {
  type: string,
}

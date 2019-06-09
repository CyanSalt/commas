export const getLauncherTab = (tabs, launcher) => {
  return tabs.find(tab => tab.launcher === launcher.id)
}

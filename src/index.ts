import KWinDriver from "./driver/kwin/kwin_driver"

export function init() {
  const driver = new KWinDriver()
  console.log("Workspace var: " + workspace);

  driver.main()
}

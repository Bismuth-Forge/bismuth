import KWinDriver from "./driver/kwin/kwin_driver"

export function init(qmlMousePoller: Plasma.PlasmaCore.DataSource) {
  const driver = new KWinDriver(qmlMousePoller)
  driver.main()
}

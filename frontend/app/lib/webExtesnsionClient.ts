export class WebExtensionClient {
  public static async triggerWebExtensionWindow(e: React.MouseEvent<HTMLElement>): Promise<void> {
    e.preventDefault()
    
    // we need some logic here when we have web extension exposed function for triggering window
    alert("clicked")
  }
}

declare module 'html2canvas' {
  interface Options {
    scale?: number
    useCORS?: boolean
    allowTaint?: boolean
    backgroundColor?: string
  }
  
  function html2canvas(element: HTMLElement, options?: Options): Promise<HTMLCanvasElement>
  export default html2canvas
}
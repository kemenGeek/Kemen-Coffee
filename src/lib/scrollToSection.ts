export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView()
  window.history.pushState(null, '', `#${id}`)
}

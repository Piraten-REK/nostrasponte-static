export const breakPoints = [768, 1366]

export const mediaSm = () => {
  return window.outerWidth < breakPoints[0]
}

export const mediaMd = () => {
  return window.outerWidth >= breakPoints[0]
}

export const mediaLg = () => {
  return window.outerWidth >= breakPoints[1]
}

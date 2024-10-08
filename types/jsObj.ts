export interface JSObj {
    key: string
    width: string
    height: string
    autostart: boolean
    controls: boolean
    playbackRateControls: string
    hlshtml: string
    preload: string
    primary: string
    image: string
    sources: Source[]
    tracks: Track[]
    cast: Cast
    skin: Skin
    captions: Captions
  }
  
  export interface Source {
    file: string
    label: string
    type: string
  }
  
  export interface Track {
    file: string
    label?: string
    kind: string
    default?: boolean
  }
  
  export interface Cast {}
  
  export interface Skin {
    url: string
    name: string
  }
  
  export interface Captions {
    color: string
    backgroundOpacity: number
    edgeStyle: string
    fontSize: number
  }
  
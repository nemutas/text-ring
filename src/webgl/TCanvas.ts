import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { resolvePath } from '../scripts/utils'
import { gl } from './core/WebGL'
import { shaders } from './shaders'
import { TextScene } from './TextScene'
// import { controls } from './utils/OrbitControls'

export class TCanvas {
  private textScene!: TextScene

  constructor(private parentNode: ParentNode) {
    this.load().then((font) => {
      this.textScene = new TextScene(font)
      this.init()
      this.createToras()
      gl.requestAnimationFrame(this.anime)
    })
  }

  private async load() {
    const loader = new FontLoader()
    const font = await loader.loadAsync(resolvePath('/resources/Roboto_Bold.json'))
    return font
  }

  private init() {
    gl.setup(this.parentNode.querySelector('.three-container')!)
    gl.scene.background = new THREE.Color('#1e1e1e')
    gl.camera.position.set(0, 3, 7)
    gl.camera.lookAt(0, 0, 0)

    gl.scene.rotation.set(0, Math.PI / 10, Math.PI / 8)

    this.resize()

    gl.setResizeCallback(() => {
      this.resize()
      this.textScene.resize()
    })
  }

  private createToras() {
    const geometry = new THREE.TorusGeometry(2, 0.6, 64, 128)
    geometry.rotateX(Math.PI / 2)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tText: { value: this.textScene.texture },
      },
      vertexShader: shaders['torusVertex'].shader,
      fragmentShader: shaders['torusFragment'].shader,
      transparent: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    gl.scene.add(mesh)
  }

  private resize() {
    const factor = THREE.MathUtils.smoothstep(gl.size.aspect, 0.5, 1)
    const scale = factor * (1 - 0.7) + 0.7
    gl.scene.scale.set(scale, scale, scale)
  }

  // ----------------------------------
  // animation
  private anime = () => {
    // controls.update()
    this.textScene.render()
    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}

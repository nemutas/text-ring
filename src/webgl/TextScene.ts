import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { Font } from 'three/examples/jsm/loaders/FontLoader'
import { gl } from './core/WebGL'
import { shaders } from './shaders'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export class TextScene {
  private renderTarget: THREE.WebGLRenderTarget
  private scene: THREE.Scene
  private mesh!: THREE.Mesh

  constructor(private font: Font) {
    this.renderTarget = new THREE.WebGLRenderTarget(gl.size.width, gl.size.height, {
      samples: 10,
    })
    this.scene = new THREE.Scene()
    this.scene.rotation.set(0, Math.PI / 10, Math.PI / 8)

    this.resize()

    this.createLights()
    this.createText()
    this.createScrollAnimation()
  }

  private createLights() {
    const ambientLight = new THREE.AmbientLight('#fff', 0.5)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight('#fff', 1)
    directionalLight.castShadow = true
    directionalLight.position.set(3, 3, 3)
    directionalLight.shadow.camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.01, 10)
    directionalLight.shadow.mapSize.set(2048, 2048)
    this.scene.add(directionalLight)

    // const helper = new THREE.CameraHelper(directionalLight.shadow.camera)
    // this.scene.add(helper)
  }

  private createText() {
    const geometry = new TextGeometry('THREE.JS TORUS', {
      font: this.font,
      size: 1,
      height: 0.5,
      curveSegments: 12,
    })
    geometry.center()
    geometry.computeBoundingBox()

    const replaceVertexShader = (shader: THREE.Shader, key: string) => {
      shader.vertexShader = shader.vertexShader.replace(shaders[key].replacer, shaders[key].shader)
    }

    const material = new THREE.MeshStandardMaterial({
      emissive: '#222',
    })

    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, {
        uMin: { value: geometry.boundingBox?.min },
        uMax: { value: geometry.boundingBox?.max },
      })
      replaceVertexShader(shader, 'define')
      replaceVertexShader(shader, 'beginnormal_vertex')
      replaceVertexShader(shader, 'begin_vertex')
    }

    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
    })
    depthMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, {
        uMin: { value: geometry.boundingBox?.min },
        uMax: { value: geometry.boundingBox?.max },
      })
      replaceVertexShader(shader, 'define')
      replaceVertexShader(shader, 'beginnormal_vertex')
      replaceVertexShader(shader, 'begin_vertex')
    }

    const mesh = new THREE.Mesh(geometry, material)
    mesh.customDepthMaterial = depthMaterial
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.scene.add(mesh)

    this.mesh = mesh
  }

  get texture() {
    return this.renderTarget.texture
  }

  resize() {
    this.renderTarget.setSize(gl.size.width, gl.size.height)

    const factor = THREE.MathUtils.smoothstep(gl.size.aspect, 0.5, 1)
    const scale = factor * (1 - 0.7) + 0.7
    this.scene.scale.set(scale, scale, scale)
  }

  // ----------------------------------
  // animation
  private targetSpeed = 0
  private speed = 0

  private createScrollAnimation() {
    let prev = 0
    ScrollTrigger.create({
      trigger: '.scroll-area',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (e) => {
        this.targetSpeed = e.progress - prev
        prev = e.progress
      },
    })
  }

  render() {
    this.targetSpeed = THREE.MathUtils.lerp(this.targetSpeed, 0, 0.05)
    this.speed = THREE.MathUtils.lerp(this.speed, this.targetSpeed, 0.05)

    const direction = this.speed < 0 ? 1 : -1
    const rot = direction * gl.time.delta * 0.3 - this.speed * 10

    this.mesh.rotation.y += rot

    gl.renderer.setRenderTarget(this.renderTarget)
    gl.renderer.render(this.scene, gl.camera)
    gl.renderer.setRenderTarget(null)
  }
}

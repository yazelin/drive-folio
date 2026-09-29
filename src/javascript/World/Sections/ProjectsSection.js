import * as THREE from 'three'
import Project from './Project'
import gsap from 'gsap'

export default class ProjectsSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.camera = _options.camera
        this.passes = _options.passes
        this.objects = _options.objects
        this.areas = _options.areas
        this.zones = _options.zones
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        // Set up
        this.items = []

        this.interDistance = 24
        this.positionRandomess = 5
        this.projectHalfWidth = 9

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setGeometries()
        this.setMeshes()
        this.setList()
        this.setZone()

        // Add all project from the list
        for(const _options of this.list)
        {
            this.add(_options)
        }
    }

    setGeometries()
    {
        this.geometries = {}
        this.geometries.floor = new THREE.PlaneGeometry(16, 8)
    }

    setMeshes()
    {
        this.meshes = {}

        // this.meshes.boardStructure = this.objects.getConvertedMesh(this.resources.items.projectsBoardStructure.scene.children, { floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture })
        this.resources.items.areaOpenTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaOpenTexture.minFilter = THREE.LinearFilter
        this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]
        this.meshes.areaLabel = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.resources.items.areaOpenTexture }))
        this.meshes.areaLabel.matrixAutoUpdate = false
    }

    setList()
    {
        // 作品清單：由 tools/projects.json 產生，素材用 tools/make_projects.py 產
        this.list = [
            {
                name: "格莉奇與黑洞先生",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze1/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze1FloorTexture,
                link: { href: "https://yazelin.github.io/glitch-vn/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            },
            {
                name: "格莉奇OS",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze2/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze2FloorTexture,
                link: { href: "https://yazelin.github.io/ai-brain-site/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            },
            {
                name: "iPAS AI 模擬考",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze3/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze3FloorTexture,
                link: { href: "https://yazelin.github.io/ipas-ai-quiz/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            },
            {
                name: "Catime",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze4/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze4FloorTexture,
                link: { href: "https://yazelin.github.io/catime/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            },
            {
                name: "真AI咏唱魔法",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze5/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze5FloorTexture,
                link: { href: "https://yazelin.github.io/ai-chant-magic/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            },
            {
                name: "Roll Formosa",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze6/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze6FloorTexture,
                link: { href: "https://yazelin.github.io/roll-formosa/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            },
            {
                name: "K-Rider K 線騎手",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze7/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze7FloorTexture,
                link: { href: "https://yazelin.github.io/k-rider/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            },
            {
                name: "AI 戰場編輯器",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze8/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze8FloorTexture,
                link: { href: "https://yazelin.github.io/battlefield-editor/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            },
            {
                name: "LINE 貼圖製造機",
                imageSources: ['A', 'B', 'C', 'D'].map((k) => `./models/projects/yaze9/slide${k}.webp`),
                floorTexture: this.resources.items.projectsYaze9FloorTexture,
                link: { href: "https://yazelin.github.io/line-sticker-studio/", x: - 4.8, y: - 3, halfExtents: { x: 3.2, y: 1.5 } },
                distinctions: []
            }
        ]
    }

    setZone()
    {
        const totalWidth = this.list.length * (this.interDistance / 2)

        const zone = this.zones.add({
            position: { x: this.x + totalWidth - this.projectHalfWidth - 6, y: this.y },
            halfExtents: { x: totalWidth, y: 12 },
            data: { cameraAngle: 'projects' }
        })

        zone.on('in', (_data) =>
        {
            this.camera.angle.set(_data.cameraAngle)
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: 0, duration: 2 })
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: 0, duration: 2 })
        })

        zone.on('out', () =>
        {
            this.camera.angle.set('default')
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: this.passes.horizontalBlurPass.strength, duration: 2 })
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: this.passes.verticalBlurPass.strength, duration: 2 })
        })
    }

    add(_options)
    {
        const x = this.x + this.items.length * this.interDistance
        let y = this.y
        if(this.items.length > 0)
        {
            y += (Math.random() - 0.5) * this.positionRandomess
        }

        // Create project
        const project = new Project({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            geometries: this.geometries,
            meshes: this.meshes,
            debug: this.debugFolder,
            x: x,
            y: y,
            ..._options
        })

        this.container.add(project.container)

        // Add tiles
        if(this.items.length >= 1)
        {
            const previousProject = this.items[this.items.length - 1]
            const start = new THREE.Vector2(previousProject.x + this.projectHalfWidth, previousProject.y)
            const end = new THREE.Vector2(project.x - this.projectHalfWidth, project.y)
            const delta = end.clone().sub(start)
            this.tiles.add({
                start: start,
                delta: delta
            })
        }

        // Save
        this.items.push(project)
    }
}

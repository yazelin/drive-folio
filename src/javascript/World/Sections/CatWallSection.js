import * as THREE from 'three'
import cats from '../../../../tools/cats.json'

// 貓圖牆:catime 最新 12 隻 AI 貓(tools/fetch_cats.py 抓的快照),一面白牆掛 6x2 幅,牆前格子按 Enter 開 catime 圖庫。
const PER_ROW = 6
const FRAME = 2.4
const GAP = 0.5

function floorText(lines, w, h)
{
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 1024, 256)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const font = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif'
    ctx.font = `bold 104px ${font}`
    ctx.fillText(lines[0], 512, lines[1] ? 92 : 128)
    if(lines[1])
    {
        ctx.font = `bold 58px ${font}`
        ctx.fillText(lines[1], 512, 200)
    }
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, alphaMap: new THREE.CanvasTexture(canvas) }))
    mesh.position.z = 0.01
    return mesh
}

export default class CatWallSection
{
    constructor(_options)
    {
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.x = _options.x
        this.y = _options.y

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        const rows = Math.ceil(cats.length / PER_ROW)
        const width = PER_ROW * (FRAME + GAP) + GAP
        const height = rows * (FRAME + GAP) + GAP + 0.6

        // 牆:靜態白色方塊,車撞得到
        const base = new THREE.Object3D()
        const wall = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, height))
        wall.name = 'shadeWhite'
        wall.position.set(0, 0, height / 2)
        base.add(wall)
        const collision = new THREE.Object3D()
        const center = new THREE.Object3D()
        center.name = 'center'
        center.position.copy(wall.position)
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        cube.name = 'cube'
        cube.position.copy(wall.position)
        cube.scale.set(width, 0.5, height)
        collision.add(center, cube)
        this.objects.add({ base, collision, offset: new THREE.Vector3(this.x, this.y, 0), rotation: new THREE.Euler(0, 0, 0), mass: 0,
            shadow: { sizeX: width + 1, sizeY: 2, offsetZ: - 0.1, alpha: 0.35 } })

        // 貓圖掛在牆的南面
        const loader = new THREE.TextureLoader()
        cats.forEach((cat, i) =>
        {
            const col = i % PER_ROW
            const row = Math.floor(i / PER_ROW)
            const texture = loader.load(`./models/cats/${cat.file}`)
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(FRAME, FRAME), new THREE.MeshBasicMaterial({ map: texture }))
            plane.rotation.x = Math.PI / 2
            plane.position.set(
                this.x - width / 2 + GAP + FRAME / 2 + col * (FRAME + GAP),
                this.y - 0.26,
                height - GAP - 0.6 - FRAME / 2 - row * (FRAME + GAP)
            )
            this.container.add(plane)
        })

        // 名牌、格子、踏腳石
        const title = floorText(['catime 貓圖牆', `每小時自動生一隻 AI 貓・這裡是最新 ${cats.length} 隻`], 12, 3)
        title.position.set(this.x, this.y - 3, 0.01)
        this.container.add(title)
        const area = this.areas.add({ position: new THREE.Vector2(this.x, this.y - 6), halfExtents: new THREE.Vector2(2, 1) })
        area.on('interact', () => window.open('https://yazelin.github.io/catime/', '_blank'))
        this.tiles.add({ start: new THREE.Vector2(- 17, 4), delta: new THREE.Vector2(this.x + 17, this.y - 11) })
    }
}

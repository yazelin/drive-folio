import * as THREE from 'three'
import lives from '../../../../tools/lives.json'

// 週三直播路:從開場往西,每一場直播一根里程碑(白色柱子,車撞得倒),地上寫日期和主題,格子按 Enter 開活動頁。
const STEP = 7

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
    let size = 104
    ctx.font = `bold ${size}px ${font}`
    while(ctx.measureText(lines[0]).width > 980 && size > 40) { size -= 4; ctx.font = `bold ${size}px ${font}` }
    ctx.fillText(lines[0], 512, lines[1] ? 92 : 128)
    if(lines[1])
    {
        size = 64
        ctx.font = `bold ${size}px ${font}`
        while(ctx.measureText(lines[1]).width > 980 && size > 28) { size -= 4; ctx.font = `bold ${size}px ${font}` }
        ctx.fillText(lines[1], 512, 200)
    }
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, alphaMap: new THREE.CanvasTexture(canvas) }))
    mesh.position.z = 0.01
    return mesh
}

export default class LiveRoadSection
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

        const title = floorText(['週三直播路', `${lives.length} 場，每週三晚上八點`], 10, 2.5)
        title.position.set(this.x + 2, this.y + 4.5, 0.01)
        this.container.add(title)
        this.tiles.add({ start: new THREE.Vector2(- 17, this.y), delta: new THREE.Vector2(this.x + 17 + 3, 0) })

        lives.forEach((live, i) =>
        {
            const x = this.x - i * STEP
            const y = this.y

            // 里程碑:會被撞倒的白柱(有質量,不是靜態)
            const base = new THREE.Object3D()
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 1.8))
            pillar.name = i === lives.length - 1 ? 'shadeOrange' : 'shadeWhite'   // 最新一場是橘色
            pillar.position.set(x, y + 1.6, 0.9)
            base.add(pillar)
            const collision = new THREE.Object3D()
            const center = new THREE.Object3D()
            center.name = 'center'
            center.position.copy(pillar.position)
            const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
            cube.name = 'cube'
            cube.position.copy(pillar.position)
            cube.scale.set(0.6, 0.6, 1.8)
            collision.add(center, cube)
            this.objects.add({ base, collision, offset: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(0, 0, 0), mass: 0.8,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.4, alpha: 0.35 }, soundName: 'woodHit' })

            const label = floorText([live.date, live.title], 6, 1.5)
            label.position.set(x, y - 1.2, 0.01)
            this.container.add(label)
            const area = this.areas.add({ position: new THREE.Vector2(x, y - 3.2), halfExtents: new THREE.Vector2(1.4, 0.8) })
            area.on('interact', () => window.open(live.href, '_blank'))
        })
    }
}

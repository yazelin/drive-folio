import * as THREE from 'three'

// 角色廣場:我的角色做成紙板人,永遠轉身面向鏡頭;腳下一塊底座(車撞得到),前面格子按 Enter 打開她們的站。
const CHARACTERS = [
    { id: 'glitch', name: '格莉奇', line: '只有 4KB 記憶體的 AI 主播', href: 'https://yazelin.github.io/ai-brain-site/', height: 4.5 },
    { id: 'blackhole', name: '黑洞先生', line: '格莉奇的製作人,什麼都吃', href: 'https://yazelin.github.io/glitch-vn/', height: 5.0 },
    { id: 'mori', name: 'Mori', line: '數位森林的精靈,每天寫田野筆記', href: 'https://yazelin.github.io/mori-field-notes/', height: 4.6 },
    { id: 'yori', name: '優理', line: '想成為圖文作家的學徒', href: 'https://yazelin.github.io/yori-growth-log/', height: 4.4 }
]
const STEP = 5.5

function floorText(lines, w, h)
{
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const font = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif'
    ctx.font = `bold ${lines.length === 1 ? 120 : 104}px ${font}`
    ctx.fillText(lines[0], 512, lines.length === 1 ? 128 : 92)
    if(lines[1])
    {
        ctx.font = `bold 58px ${font}`
        ctx.fillText(lines[1], 512, 200)
    }
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, alphaMap: new THREE.CanvasTexture(canvas) })
    )
    mesh.position.z = 0.01
    return mesh
}

export default class CharacterPlazaSection
{
    constructor(_options)
    {
        this.time = _options.time
        this.camera = _options.camera
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.x = _options.x
        this.y = _options.y

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.standees = []

        this.setPath()
        this.setCharacters()

        // 紙板人每一幀轉向鏡頭(只轉 z 軸,永遠站直)
        this.time.on('tick', () =>
        {
            const cam = this.camera.instance.position
            for(const s of this.standees)
            {
                s.rotation.z = Math.atan2(cam.x - s.position.x, - (cam.y - s.position.y))
            }
        })
    }

    setPath()
    {
        this.tiles.add({
            start: new THREE.Vector2(12, 0),
            delta: new THREE.Vector2(this.x - 16, this.y)
        })
        const title = floorText(['角色廣場', '開到她們腳前的格子按 Enter'], 12, 3)
        title.position.set(this.x + STEP * 1.5, this.y - 5.5, 0.01)
        this.container.add(title)
    }

    setCharacters()
    {
        const loader = new THREE.TextureLoader()
        CHARACTERS.forEach((c, i) =>
        {
            const x = this.x + i * STEP
            const y = this.y

            // 底座:靜態的白色方塊,車撞得到
            const base = new THREE.Object3D()
            const pedestal = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 0.4))
            pedestal.name = 'shadeWhite'
            pedestal.position.set(0, 0, 0.2)
            base.add(pedestal)
            const collision = new THREE.Object3D()
            const center = new THREE.Object3D()
            center.name = 'center'
            center.position.set(0, 0, 0.2)
            const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
            cube.name = 'cube'
            cube.position.set(0, 0, 0.2)
            cube.scale.set(2.2, 1.4, 0.4)
            collision.add(center, cube)
            this.objects.add({ base, collision, offset: new THREE.Vector3(x, y, 0), rotation: new THREE.Euler(0, 0, 0), mass: 0,
                shadow: { sizeX: 2.6, sizeY: 1.8, offsetZ: - 0.1, alpha: 0.35 } })

            // 紙板人:外層 pivot 負責轉向,內層平面站起來
            const standee = new THREE.Object3D()
            standee.position.set(x, y, 0.4)
            const texture = loader.load(`./models/characters/${c.id}.webp`, (t) =>
            {
                const ratio = t.image.width / t.image.height
                plane.scale.set(c.height * ratio, c.height, 1)
            })
            texture.colorSpace = THREE.SRGBColorSpace
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(1, 1),
                new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide })
            )
            plane.geometry.translate(0, 0.5, 0)   // 腳底在原點
            plane.rotation.x = Math.PI / 2          // 站起來(z 軸朝上)
            standee.add(plane)
            this.container.add(standee)
            this.standees.push(standee)

            // 名牌與格子
            const label = floorText([c.name, c.line], 4.8, 1.2)
            label.position.set(x, y - 2.2, 0.01)
            this.container.add(label)
            const area = this.areas.add({ position: new THREE.Vector2(x, y - 3.8), halfExtents: new THREE.Vector2(1.6, 0.9) })
            area.on('interact', () => window.open(c.href, '_blank'))
        })
    }
}

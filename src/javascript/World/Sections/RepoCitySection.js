import * as THREE from 'three'
import data from '../../../../tools/repos.json'

// repo 城市:每個公開 repo 一棟樓。資料來自 tools/repos.json(python3 tools/fetch_repos.py 產生)。
// 樓高看星星數、顏色看主要語言、紅屋頂 = 有網頁;開進樓前的格子按 Enter 就打開(有網頁開網頁,沒有開 repo)。

// 語言 → 原作現成的 matcap 顏色(Materials.js 的 shades)
const LANG_SHADE = {
    JavaScript: 'yellow', TypeScript: 'blue', HTML: 'orange', CSS: 'purple', Python: 'green',
    Rust: 'brown', 'C#': 'purple', Shell: 'gray', Go: 'emeraldGreen', Vue: 'emeraldGreen'
}

const COLS = 6          // 每區每排幾棟
const STEP_X = 5.5      // 樓與樓的間距
const STEP_Y = 7        // 排與排的間距(樓前要留格子與名牌)
const BLOCK_GAP = 10    // 區與區的間距
const SIZE = 2.4        // 樓的底面邊長

function labelTexture(lines, width = 512, height = 128)
{
    // 名牌:白字黑底,當 alphaMap 用(跟原作地上的字同一種做法)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const sizes = lines.length === 1 ? [0.5] : [0.42, 0.26]
    lines.forEach((text, i) =>
    {
        let size = height * sizes[i]
        ctx.font = `bold ${size}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif`
        while(ctx.measureText(text).width > width * 0.94 && size > 10)
        {
            size -= 2
            ctx.font = `bold ${size}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif`
        }
        const y = lines.length === 1 ? height / 2 : (i === 0 ? height * 0.36 : height * 0.76)
        ctx.fillText(text, width / 2, y)
    })
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    return texture
}

function floorText(lines, w, h, width, height)
{
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, alphaMap: labelTexture(lines, width, height) })
    )
    mesh.position.z = 0.01
    return mesh
}

export default class RepoCitySection
{
    constructor(_options)
    {
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.x = _options.x
        this.y = _options.y

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setLayout()
        this.setEntrance()
        this.setDistricts()
    }

    setLayout()
    {
        // 6 個區排成三欄兩列,每區的深度看那區有幾排
        const districts = data.districts.map((d) => ({ ...d, repos: data.repos.filter((r) => r.district === d.id) }))
        const blockW = COLS * STEP_X
        const perRow = 3
        this.blocks = []
        for(let row = 0; row * perRow < districts.length; row++)
        {
            const rowItems = districts.slice(row * perRow, row * perRow + perRow)
            const depth = Math.max(...rowItems.map((d) => Math.ceil(d.repos.length / COLS))) * STEP_Y
            const y0 = this.blocks.length ? this.blocks[this.blocks.length - 1].yEnd + BLOCK_GAP : 0
            rowItems.forEach((d, i) =>
            {
                const x0 = (i - (perRow - 1) / 2) * (blockW + BLOCK_GAP) - blockW / 2
                this.blocks.push({ ...d, x0, y0: y0 + 6, yEnd: y0 + 6 + depth })
            })
        }
    }

    setEntrance()
    {
        // 從開場往北鋪一條踏腳石,盡頭寫城市名字
        this.tiles.add({
            start: new THREE.Vector2(this.x, 13),
            delta: new THREE.Vector2(0, this.y - 24)
        })
        const sign = floorText([`REPO 城市`, `${data.repos.length} 個公開 repo・開過去按 Enter 打開`], 14, 3.5, 1024, 256)
        sign.position.set(this.x, this.y - 8, 0.01)
        this.container.add(sign)
    }

    setDistricts()
    {
        for(const block of this.blocks)
        {
            // 區名寫在區的南邊地上
            const title = floorText([block.name, `${block.repos.length} 個`], COLS * STEP_X - 2, 5, 1024, 256)
            title.position.set(this.x + block.x0 + (COLS * STEP_X) / 2, this.y + block.y0 - 3.2, 0.01)
            this.container.add(title)

            block.repos.forEach((repo, i) =>
            {
                const col = i % COLS
                const row = Math.floor(i / COLS)
                const x = this.x + block.x0 + STEP_X / 2 + col * STEP_X
                const y = this.y + block.y0 + STEP_Y / 2 + row * STEP_Y + 1
                this.addBuilding(repo, x, y)
            })
        }
    }

    addBuilding(repo, x, y)
    {
        const height = 1.2 + Math.log2(repo.stars + 1) * 1.1
        const shade = LANG_SHADE[repo.lang] || 'beige'

        const base = new THREE.Object3D()
        const body = new THREE.Mesh(new THREE.BoxGeometry(SIZE, SIZE, height))
        body.name = `shade${shade[0].toUpperCase()}${shade.slice(1)}`
        body.position.set(0, 0, height / 2)
        base.add(body)
        if(repo.home)
        {
            // 有網頁的樓,屋頂蓋一塊紅色的(gold 的 matcap 畫出來是彩虹色)
            const roof = new THREE.Mesh(new THREE.BoxGeometry(SIZE * 0.8, SIZE * 0.8, 0.3))
            roof.name = 'shadeRed'
            roof.position.set(0, 0, height + 0.15)
            base.add(roof)
        }

        const collision = new THREE.Object3D()
        const center = new THREE.Object3D()
        center.name = 'center'
        center.position.set(0, 0, height / 2)
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        cube.name = 'cube'
        cube.position.copy(center.position)
        cube.scale.set(SIZE, SIZE, height)
        collision.add(center, cube)

        this.objects.add({
            base,
            collision,
            // 原作的靜態物件是「模型畫在原點＋offset 給世界座標」;陰影跟著容器(= offset)走
            offset: new THREE.Vector3(x, y, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: SIZE * 1.3, sizeY: SIZE * 1.3, offsetZ: - 0.1, alpha: 0.35 },
            mass: 0
        })

        // 樓前:名牌＋可以按 Enter 的格子
        const label = floorText([repo.name, `★ ${repo.stars}${repo.home ? '・紅屋頂有網頁' : ''}`], 4.6, 1.15, 512, 128)
        label.position.set(x, y - SIZE / 2 - 1.1, 0.01)
        this.container.add(label)

        const area = this.areas.add({
            position: new THREE.Vector2(x, y - SIZE / 2 - 2.6),
            halfExtents: new THREE.Vector2(1.6, 0.9)
        })
        area.on('interact', () =>
        {
            window.open(repo.home || repo.url, '_blank')
        })
    }
}

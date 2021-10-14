const RED_CELL_COLOR = '#fb3a18'
const BLUE_CELL_COLOR = '#3690c7'
const EMPTY_CELL_COLOR = '#cba976'
const GAME_OVER_CELL_COLOR = '#4c403a'

const CELL_COUNT = 5

const EMPTY_STATUS = 'empty'
const RED_STATUS = 'red'
const BLUE_STATUS = 'blue'
const GAME_OVER_STATUS = 'over'

const BLUE_COLOR = 0
const RED_COLOR = 1

const STATUSES = [EMPTY_STATUS, RED_STATUS, BLUE_STATUS, GAME_OVER_STATUS]

function CodeNamesGame(field, wordsBox) {
    this.field = field
    this.wordsBox = wordsBox

    this.padding = 12
    this.border = 15
    this.radius = 20
    this.fieldSize = field.clientWidth
    this.fieldColors = ['#47c6ff', '#fd5337']
    this.fieldBorderColors = ['#416fad', '#9d3b3a']
    this.colorIndex = BLUE_COLOR

    this.cardUrls = {}
    this.cardUrls[RED_STATUS] = ['cards/red1.jpg', 'cards/red2.jpg', 'cards/red_blue.jpg']
    this.cardUrls[BLUE_STATUS] = ['cards/blue1.jpg', 'cards/blue2.jpg', 'cards/blue_red.jpg']
    this.cardUrls[EMPTY_STATUS] = ['cards/empty1.jpg', 'cards/empty2.jpg']
    this.cardUrls[GAME_OVER_STATUS] = ['cards/game_over.jpg']

    this.InitField()
    this.InitWords()
}

CodeNamesGame.prototype.MakePath = function(stroke, fill, strokeWidth, d) {
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('stroke', stroke)
    path.setAttribute('fill', fill)
    path.setAttribute('stroke-width', strokeWidth)
    path.setAttribute('d', d)

    return path
}

CodeNamesGame.prototype.MakeCell = function(x, y, cellSize, status) {
    let radius = cellSize / 5
    let colors = []

    colors[EMPTY_STATUS] = EMPTY_CELL_COLOR
    colors[RED_STATUS] = RED_CELL_COLOR
    colors[BLUE_STATUS] = BLUE_CELL_COLOR
    colors[GAME_OVER_STATUS] = GAME_OVER_CELL_COLOR

    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(this.MakePath('#000', colors[status], '1', `
        M ${x + radius} ${y}
        l ${cellSize - 2 * radius} 0
        q ${radius} 0 ${radius} ${radius}
        l 0 ${cellSize - 2 * radius}
        q 0 ${radius} ${-radius} ${radius}
        l ${-cellSize + 2 * radius} 0
        q ${-radius} 0 ${-radius} ${-radius}
        l 0 ${-cellSize + 2 * radius}
        q 0 ${-radius} ${radius} ${-radius}
    `))


    if (status == RED_STATUS) {
        let size = cellSize / 4
        g.appendChild(this.MakePath('#ff8474', '#ee4723', '2', `
            M ${x + cellSize / 2} ${y + cellSize / 2 - size}
            l ${size} ${size} l ${-size} ${size}
            l ${-size} ${-size}
            l ${size} ${-size}
        `))
    }
    else if (status == BLUE_STATUS) {
        let size = cellSize / 5
        g.appendChild(this.MakePath('#79c5f7', '#238dcb', '2', `
            M ${x + cellSize / 2} ${y + cellSize / 2}
            m ${-size} 0
            a ${size} ${size} 0 1 0 ${2 * size} 0
            a ${size} ${size} 0 1 0 ${-2 * size} 0
        `))
    }
    else if (status == GAME_OVER_STATUS) {
        let size = cellSize / 2.5 + 2
        g.appendChild(this.MakePath('#7f746f', '#000', '5', `
            M ${x + cellSize / 2 - size / 2} ${y + cellSize / 2 - size / 2} l ${size} ${size}
            M ${x + cellSize / 2 - size / 2} ${y + cellSize / 2 + size / 2} l ${size} ${-size}
        `))

        size -= 2
        g.appendChild(this.MakePath('#000', '#000', '3', `
            M ${x + cellSize / 2 - size / 2} ${y + cellSize / 2 - size / 2} l ${size} ${size}
            M ${x + cellSize / 2 - size / 2} ${y + cellSize / 2 + size / 2} l ${size} ${-size}
        `))
    }

    return g
}

CodeNamesGame.prototype.SetColor = function(colorIndex) {
    this.colorIndex = colorIndex
    this.colorsPath.setAttribute('fill', this.fieldColors[this.colorIndex])
    this.colorsPath.setAttribute('stroke', this.fieldBorderColors[this.colorIndex])
}

CodeNamesGame.prototype.SetCellStatus = function(cellIndex, status, needHide = false) {
    let cell = this.cells[cellIndex]
    this.field.removeChild(cell.cell)
    cell.status = status
    cell.cell = this.MakeCell(cell.x, cell.y, cell.cellSize, cell.status)
    this.field.appendChild(cell.cell)
    cell.cell.addEventListener('mousedown', (e) => this.UpdateCell(e, cellIndex))

    let img = document.getElementById('card-img-' + cellIndex)
    img.src = this.Choice(this.cardUrls[status])

    if (needHide) {
        img.style.display = 'none'
    }
}

CodeNamesGame.prototype.UpdateCell = function(e, cellIndex) {
    let index = STATUSES.indexOf(this.cells[cellIndex].status)
    let delta = e.button == 0 ? 1 : STATUSES.length - 1

    this.SetCellStatus(cellIndex, STATUSES[(index + delta) % STATUSES.length])
}

CodeNamesGame.prototype.InitCells = function(cellPadding, cellSize, cellOffset) {
    this.cells = []

    for (let i = 0; i < CELL_COUNT; i++) {
        for (let j = 0; j < CELL_COUNT; j++) {
            let x = cellPadding + j * (cellSize + cellOffset)
            let y = cellPadding + i * (cellSize + cellOffset)
            let statuses = [EMPTY_STATUS, RED_STATUS, BLUE_STATUS, GAME_OVER_STATUS]
            let cell = this.MakeCell(x, y, cellSize, EMPTY_STATUS)

            this.cells.push({ cell: cell, x: x, y: y, cellSize: cellSize, status: EMPTY_STATUS })
            this.field.appendChild(cell)

            cell.addEventListener('mousedown', (e) => this.UpdateCell(e, i * CELL_COUNT + j))
        }
    }
}

CodeNamesGame.prototype.GenerateField = function() {
    let redCount = Math.floor((CELL_COUNT*CELL_COUNT - 1) / 3)
    let blueCount = redCount + 1
    let emptyCount = CELL_COUNT*CELL_COUNT - redCount - blueCount - 1

    if (this.colorIndex == RED_COLOR) {
        redCount++
        blueCount--
    }

    let statuses = []

    for (let i = 0; i < redCount; i++)
        statuses.push(RED_STATUS)

    for (let i = 0; i < blueCount; i++)
        statuses.push(BLUE_STATUS)

    for (let i = 0; i < emptyCount; i++)
        statuses.push(EMPTY_STATUS)

    statuses.push(GAME_OVER_STATUS)
    statuses.sort((a, b) => Math.random() < 0.5 ? -1 : 1)

    for (let i = 0; i < CELL_COUNT * CELL_COUNT; i++) {
        this.SetCellStatus(i, statuses.pop())
    }
}

CodeNamesGame.prototype.ChangeColor = function() {
    this.SetColor(this.colorIndex == RED_COLOR ? BLUE_COLOR : RED_COLOR)
}

CodeNamesGame.prototype.ResetField = function() {
    for (let i = 0; i < CELL_COUNT * CELL_COUNT; i++) {
        this.SetCellStatus(i, EMPTY_STATUS, true)
    }
}

CodeNamesGame.prototype.InitField = function() {
    let part = this.fieldSize / 5
    let colorWidth = this.fieldSize / 8
    let colorHeight = colorWidth / 4
    let colorIndex = 0

    let innerPadding = this.padding + this.border + 12

    let cellPadding = innerPadding + 10
    let cellOffset = 3
    let cellSize = (this.fieldSize - 2 * cellPadding - (CELL_COUNT - 1) * cellOffset) / CELL_COUNT

    this.field.appendChild(this.MakePath('#5f351e', '#845337', '2', `
        M ${this.padding + part} ${this.padding + this.border}
        L ${this.fieldSize - this.padding - part} ${this.padding + this.border}
        L ${this.fieldSize - this.padding - part + this.border} ${this.padding}
        L ${this.fieldSize - this.padding - this.radius} ${this.padding}
        Q ${this.fieldSize - this.padding} ${this.padding} ${this.fieldSize - this.padding} ${this.padding + this.radius}

        L ${this.fieldSize - this.padding} ${this.padding + part - this.border}
        L ${this.fieldSize - this.padding - this.border} ${this.padding + part}
        L ${this.fieldSize - this.padding - this.border} ${this.fieldSize - this.padding - part - this.border}
        L ${this.fieldSize - this.padding} ${this.fieldSize - this.padding - part}
        L ${this.fieldSize - this.padding} ${this.fieldSize - this.padding - this.radius}
        Q ${this.fieldSize - this.padding} ${this.fieldSize - this.padding} ${this.fieldSize - this.padding - this.radius} ${this.fieldSize - this.padding}

        L ${this.fieldSize - this.padding - part + this.border} ${this.fieldSize - this.padding}
        L ${this.fieldSize - this.padding - part} ${this.fieldSize - this.padding - this.border}
        L ${this.padding + part + this.border} ${this.fieldSize - this.padding - this.border}
        L ${this.padding + part} ${this.fieldSize - this.padding}
        L ${this.padding + this.radius} ${this.fieldSize - this.padding}
        Q ${this.padding} ${this.fieldSize - this.padding} ${this.padding} ${this.fieldSize - this.padding - this.radius}

        L ${this.padding} ${this.fieldSize - this.padding - part + this.border}
        L ${this.padding + this.border} ${this.fieldSize - this.padding - part}
        L ${this.padding + this.border} ${this.padding + part + this.border}
        L ${this.padding} ${this.padding + part}
        L ${this.padding} ${this.padding + this.radius}
        Q ${this.padding} ${this.padding} ${this.padding + this.radius} ${this.padding}

        L ${this.padding + part - this.border} ${this.padding}
        L ${this.padding + part} ${this.padding + this.border}
    `))

    this.colorsPath = this.MakePath(this.fieldBorderColors[this.colorIndex], this.fieldColors[this.colorIndex], '2', `
        M ${this.fieldSize / 2 - colorWidth / 2} ${this.padding + this.border - 2} l ${colorWidth} 0 l 0 ${-colorHeight} l ${-colorWidth} 0 l 0 ${colorHeight}
        M ${this.fieldSize / 2 - colorWidth / 2} ${this.fieldSize - this.padding - this.border + 2} l ${colorWidth} 0 l 0 ${colorHeight} l ${-colorWidth} 0 l 0 ${-colorHeight}
        M ${this.padding + this.border - 2} ${this.fieldSize / 2 - colorWidth / 2} l 0 ${colorWidth} l ${-colorHeight} 0 l 0 ${-colorWidth} l ${colorHeight} 0
        M ${this.fieldSize - this.padding - this.border + 2} ${this.fieldSize / 2 - colorWidth / 2} l 0 ${colorWidth} l ${colorHeight} 0 l 0 ${-colorWidth} l ${-colorHeight} 0
    `)

    this.field.appendChild(this.colorsPath)

    this.field.appendChild(this.MakePath('#5f351e', '#000', '4', `
        M ${innerPadding + this.radius} ${innerPadding}
        L ${this.fieldSize - innerPadding - this.radius} ${innerPadding}
        Q ${this.fieldSize - innerPadding} ${innerPadding} ${this.fieldSize - innerPadding} ${innerPadding + this.radius}
        L ${this.fieldSize - innerPadding} ${this.fieldSize - innerPadding - this.radius}
        Q ${this.fieldSize - innerPadding} ${this.fieldSize - innerPadding} ${this.fieldSize - innerPadding - this.radius} ${this.fieldSize - innerPadding}
        L ${innerPadding + this.radius} ${this.fieldSize - innerPadding}
        Q ${innerPadding} ${this.fieldSize - innerPadding} ${innerPadding} ${this.fieldSize - innerPadding - this.radius}
        L ${innerPadding} ${innerPadding + this.radius}
        Q ${innerPadding} ${innerPadding} ${innerPadding + this.radius} ${innerPadding}
    `))

    this.InitCells(cellPadding, cellSize, cellOffset)
}

CodeNamesGame.prototype.MakeDiv = function(className = '', innerHTML = '') {
    let div = document.createElement('div')
    div.className = className
    div.innerHTML = innerHTML
    return div
}

CodeNamesGame.prototype.Choice = function(collection) {
    return collection[Math.floor(Math.random() * collection.length)]
}

CodeNamesGame.prototype.ClickByCard = function(e, div, img) {
    if (e.target.tagName == 'INPUT')
        return

    img.style.display = img.style.display == 'none' ? '' : 'none'
}

CodeNamesGame.prototype.MakeWordDiv = function(word, index) {
    let div = document.createElement('div')
    div.className = 'word-block'
    div.id = 'word-' + index

    let inner = this.MakeDiv('word-inner-block')
    let circle = this.MakeDiv('circle-block')
    circle.appendChild(this.MakeDiv('circle'))

    let rotated = this.MakeDiv('rotated', word)

    let input = document.createElement('input')
    input.type = 'text'
    input.value = word
    input.className = 'word-input'
    input.addEventListener('input', () => rotated.innerHTML = input.value)
    input.addEventListener('change', () => rotated.innerHTML = input.value)

    let bottom = this.MakeDiv('bottom')

    bottom.appendChild(rotated)
    bottom.appendChild(document.createElement('hr'))
    bottom.appendChild(input)
    inner.appendChild(circle)
    inner.appendChild(bottom)
    div.appendChild(inner)

    let img = document.createElement('img')
    img.src = this.Choice(this.cardUrls[this.cells[index].status])
    img.className = 'card-img'
    img.id = 'card-img-' + index
    img.style.display = 'none'
    div.appendChild(img)

    div.addEventListener('mousedown', (e) => this.ClickByCard(e, div, img))
    return div
}

CodeNamesGame.prototype.GetRandomWords = function(n) {
    let words = new Set()

    for (let i = 0; i < n; i++) {
        let word = this.Choice(WORDS)

        while (words.has(word))
            word = this.Choice(WORDS)

        words.add(word)
    }

    return Array.from(words)
}

CodeNamesGame.prototype.InitWords = function() {
    let table = document.createElement('div')
    table.className = 'table'
    let words = this.GetRandomWords(CELL_COUNT * CELL_COUNT)

    for (let i = 0; i < CELL_COUNT; i++) {
        let tr = document.createElement('div')

        for (let j = 0; j < CELL_COUNT; j++) {
            let word = words[i * CELL_COUNT + j]
            let div = this.MakeWordDiv(word, i * CELL_COUNT + j)

            let td = document.createElement('div')
            td.className = 'cell'
            td.style.width = (100 / CELL_COUNT) + '%'

            td.appendChild(div)
            tr.appendChild(td)
        }

        table.appendChild(tr)
    }

    this.wordsBox.innerHTML = ''
    this.wordsBox.appendChild(table)
}

CodeNamesGame.prototype.HideCardImages = function() {
    for (let i = 0; i < CELL_COUNT * CELL_COUNT; i++) {
        let img = document.getElementById('card-img-' + i)
        img.style.display = 'none'
    }
}

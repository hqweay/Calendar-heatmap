import * as d3 from 'd3'
import axios from 'axios'

export async function heatmap() {
  const width = 1000
  const height = 180
  const margin = 30
  const weekBoxWidth = 20
  const monthBoxHeight = 20
  
  // 删除上一次作图
  d3.select('#calendarHeatmapContent').selectAll('*').remove()
  // 获取svg并定义svg高度和宽度
  const svg = d3.select('#calendarHeatmapContent').append('svg').attr('width', width).attr('height', height)
  // 绘制图区
  monthCoordinate(width, margin, weekBoxWidth, svg)
  weekCoordinate(height, margin, monthBoxHeight, svg)
  dateSquares(height, margin, weekBoxWidth, monthBoxHeight, svg)
}

function monthCoordinate(width: number, margin: number, weekBoxWidth: number, svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {
  const months = () => {
    const year = new Date().getFullYear()
    const months = []
    for (let i = 1; i <= 12; i++) {
      const month = year + '-' + i
      months.push(month)
    }
    return months
  }
  // 绘制月坐标
  const monthBox = svg
    .append('g')
    .attr(
      'transform',
      'translate(' + (margin + weekBoxWidth) + ', ' + margin + ')'
    )
  const monthScale = d3
    .scaleLinear()
    .domain([0, months().length])
    .range([20, width - margin - weekBoxWidth - 20])
  monthBox
    .selectAll('text')
    .data(months())
    .enter()
    .append('text')
    .text((v) => {
      return v
    })
    .attr('font-size', '0.9em')
    .attr('font-family', 'monospace')
    .attr('fill', '#999')
    .attr('x', (v: any, i: d3.NumberValue) => {
      return monthScale(i)
    })
}

function weekCoordinate(height: number, margin: number, monthBoxHeight: number, svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {
  const weeks = ['日', '二', '四', '六']
  const weekBox = svg
    .append('g')
    .attr(
      'transform',
      'translate(' + (margin - 10) + ', ' + (margin + monthBoxHeight) + ')'
    )
  const weekScale = d3
    .scaleLinear()
    .domain([0, weeks.length])
    .range([0, height - margin - monthBoxHeight + 14])

  weekBox
    .selectAll('text')
    .data(weeks)
    .enter()
    .append('text')
    .text((v) => {
      return v
    })
    .attr('font-size', '0.85em')
    .attr('fill', '#CCC')
    .attr('y', (v: any, i: d3.NumberValue) => {
      return weekScale(i)
    })
}

async function dateSquares(height: number, margin: number, weekBoxWidth: number, monthBoxHeight: number, svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {
  const data = await dataChart()
  const cellBox = svg
    .append('g')
    .attr(
      'transform',
      'translate(' + (margin + weekBoxWidth) + ', ' + (margin + 10) + ')'
    )
  // 设置方块间距
  const cellMargin = 4
  // 计算方块大小
  const cellSize = (height - margin - monthBoxHeight - cellMargin * 6 - 10) / 7
  // 方块列计数器
  let cellCol = 0
  const cell = cellBox
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('rx', 3)
    .attr('fill', function (d) {
      if (d.total === undefined || d.total === 0) {
        return '#ebedf0'
      }
      let total = d.total
      if (total > 0) {
        if (total <= 30) {
          return '#9be9a8'
        } else if (total <= 70) {
          return '#40c463'
        } else if (total <= 120) {
          return '#30a14e'
        }
        return '#216e39'
      }
      return '#ebedf0'
    })
    .attr('x', (v, i) => {
      if (i % 7 === 0) {
        cellCol++
      }
      const x = (cellCol - 1) * cellSize
      return cellCol > 1 ? x + cellMargin * (cellCol - 1) : x
    })
    .attr('y', (v, i) => {
      const y = i % 7
      return y > 0 ? y * cellSize + cellMargin * y : y * cellSize
    })
    .style('cursor', 'pointer')
  // 日期方块添加鼠标移入时的数据提示
  cell.append('title').text((d) => {
    let message = '没有内容块'
    if (d.total != 0 || d.total != undefined) {
      message = '有 ' + d.total + '个内容块'
    }
    return d.day + '\n' + message
  })
}

async function dataChart() {
  let data = []
  // 获去当前年
  const date = new Date()
  const year = date.getFullYear()
  const localDay = year + '-' + (date.getMonth() + 1) + '-' + date.getDate()
  const heatmapData = JSON.parse(localStorage.getItem('calendar-heatmap-data'))
  if (heatmapData === null) {
    await formatDate(year, localDay, data)
  } else {
    const count = queryCount(year, date.getMonth() + 1, date.getDate())
    const arrData = heatmapData.data
    const newData = []
    data.slice(0, data.length)
    for (let i = 0; i < arrData.length; i++) {
      if (arrData[i].day === localDay) {
        newData.push({ day: arrData[i].day, total: count })
      } else {
        newData.push(arrData[i])
      }
    }
    data = newData
  }
  localStorage.setItem('calendar-heatmap-data', JSON.stringify({ data }))
  return data
}
async function formatDate(year: number, localDay: string, data: any[]) {
  for (let index = 0; index < 12; index++) {
    const month = index + 1
    const monthNumber = new Date(year, month, 0).getDate()
    for (let index = 1; index < monthNumber + 1; index++) {
      const day = year + '-' + month + '-' + index
      if (new Date(day) > new Date(localDay)) {
        data.push({ day, total: 0 })
      } else {
        const total = await queryCount(year, month, index)
        data.push({ day, total })
      }
    }
  }
  return data
}

export async function queryCount(year: number, month: number, day: number) {
  const dateStr =
    year.toString() +
    (month < 10 ? '0' + month.toString() : month.toString()) +
    (day < 10 ? '0' + day.toString() : day.toString())
  const localConfig = localStorage.getItem('calendar-heatmap-config')
  let sql = ''
  if (localConfig === null) {
    sql = `SELECT count(*) AS count FROM blocks WHERE type = 'p' AND created like '${dateStr + '%'}'`
  } else {
    const { isdailyNote, ignore } = JSON.parse(localConfig)

    if (isdailyNote === true) {
      sql = `SELECT COUNT(*) AS count FROM blocks WHERE TYPE = 'p' AND hpath IN (SELECT hpath FROM blocks WHERE hpath LIKE '/daily note%') AND created like '${dateStr + '%'}'`
    } else if (ignore !== null && ignore !== undefined && ignore != '') {
      sql = `SELECT COUNT(*) AS count FROM blocks WHERE TYPE = 'p' AND hpath NOT IN (SELECT hpath FROM blocks WHERE `
      const arrData = ignore.split(',')
      for (let i = 0; i < arrData.length; i++) {
        const element = arrData[i]
        sql = sql + `hpath LIKE '/${element}%' ${i === arrData.length - 1 ? '' : 'OR '}`
      }
      sql = sql + `) AND created like '${dateStr + '%'}'`
    } else {
      sql = `SELECT count(*) AS count FROM blocks WHERE type = 'p' AND created like '${dateStr + '%'}'`
    }
  }

  const sqlData = { stmt: sql }

  return await axios.post('/api/query/sql', sqlData).then(function (response) {
    return response.data.data[0].count
  })
}
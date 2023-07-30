/**
 * 绘制图区
 * @returns element
 */

import {getColor} from "./utils";

export async function viewElement() {
  let color = ''
  // 包裹图层
  const divElement = document.createElement('div')
  divElement.setAttribute('id', 'openViewElement')
  // 热力图显示区域
  const calendarHeatmapContent = document.createElement('div')
  calendarHeatmapContent.setAttribute('id', 'calendarHeatmapContent')
  divElement.appendChild(calendarHeatmapContent)
  // @ts-ignore
  divElement.setAttribute('style', `background-color: ${siyuan.config.appearance.mode === 0 ? '#FFFFFF' : '#0D1117'};`)
  // 今日块统计区域
  const topElement = document.createElement('div')
  topElement.setAttribute('style', 'letter-spacing: 1px;font-size: 11px;font-family: monospace; color: #5D6063; height:30px')
  const topLeftElement = document.createElement('div');
  topLeftElement.setAttribute('id', 'StatisticalRegion')
  topLeftElement.setAttribute('style', 'padding-left: 32px;')
  topLeftElement.style.float = 'left'
  topElement.appendChild(topLeftElement)
  const colors = await getColor()
  colors.forEach(item => {
    color = color + (`<span style="width: 10px; height: 10px; display:block; float:left; background-color: ${item}; margin-left: 1px; margin-top: 10px; border-radius: 2px"></span>`)
  })
  topElement.insertAdjacentHTML('beforeend', `<div style="float: right; padding-right: 10px;"><span style="float: left; padding-right: 3px; padding-top: 2px;">少</span><span>${color}</span><span style="padding-left: 5px; padding-top: 2px;">多</span></div>`)
  divElement.appendChild(topElement)

  return divElement
}

export const settingElement = `<div class='config__tab-container' id='heatmapSettingsDialog'>
                                  <label class="fn__flex b3-label config__item">
                                      <div class="fn__flex-1">
                                          显示位置
                                          <div class="b3-label__text">是否显示在顶栏左侧，重启后生效，默认显示在顶栏右侧</div>
                                      </div>
                                      <span class="fn__space"></span>
                                      <input class='b3-switch fn__flex-center' id='calendarHeatmapConfigPosition' type='checkbox'>
                                  </label>
                                  <lable class='fn__flex b3-label'>
                                    <div class='fn__flex-1'>
                                    日记
                                      <div class='b3-label__text'>启用后将只统计归属于daily note中的内容块</div>
                                      <span class='fn__space'></span>
                                    </div>
                                    <input class='b3-switch fn__flex-center' id='calendarHeatmapConfigCheckbox' type='checkbox'>
                                  </lable>
                                  <label class='b3-label fn__flex'>
                                    <div class='fn__flex-1'>
                                      自定义配色
                                      <div class="b3-label__text">请使用英文状态下的逗号 <code class="fn__code">,</code> 进行分隔，请输入五种配色，请使用<code class="fn__code">HEX</code>颜色，例子：<code class="fn_code">#ebedf0,#9be9a8,#40c463,#30a14e,#216e39</code></div>
                                      <div class='fn__hr'></div>
                                      <textarea class='b3-text-field fn__block' 
                                                id='calendarHeatmapConfigColor' 
                                                style='height: 30px;' placeholder=''></textarea>
                                    </div>
                                  </label>
                                  <label class='b3-label fn__flex'>
                                    <div class='fn__flex-1'>
                                      忽略统计文件
                                      <div class='b3-label__text'>请输入所需忽略的文件，并用英文逗号隔开</div>
                                      <div class='fn__hr'></div>
                                      <textarea class='b3-text-field fn__block' 
                                                id='calendarHeatmapConfigText' 
                                                style='height: 50px;' placeholder='请输入需要忽略的文档全名称，并且用英文逗号隔开'></textarea>
                                    </div>
                                  </label>
                                </div>`

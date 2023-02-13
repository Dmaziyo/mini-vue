const HTML_TAGS =
  'html,body,base,head,link,meta,style,title,address,article,aside,footer,' +
  'header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,' +
  'figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,' +
  'data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,' +
  'time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,' +
  'canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,' +
  'th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,' +
  'option,output,progress,select,textarea,details,dialog,menu,' +
  'summary,template,blockquote,iframe,tfoot'

const VOID_TAGS =
  'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'

// 将所有的tag放入map中,并返回一个判断函数
function makeMap(str) {
  const map = str
    .split(',')
    // 执行((map[item] = true), map),先执行前面的,然后返回后面的结果
    .reduce((map, item) => ((map[item] = true), map), Object.create(null))
  return val => !!map[val]
}

export const isVoidTag = makeMap(VOID_TAGS)
export const isNativeTag = makeMap(HTML_TAGS)
//  isNativeTag('div')

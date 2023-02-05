// event queue
const queue = []

let isFlushing = false

const resolvedPromise = Promise.resolve()
let currentFlushPromise = null

// 因为当修改了reactive的值后,再进行同步代码的操作,获取到的数值是之前的,需要在宏任务中才能得到更新的值
export function nextTick(fn) {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(fn) : p
}

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

function queueFlush() {
  if (!isFlushing) {
    isFlushing = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  try {
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i]
      job()
    }
  } finally {
    isFlushing = false
    queue.length = 0
    currentFlushPromise = null
  }
}

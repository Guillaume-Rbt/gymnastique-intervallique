export default class {
    constructor() {
        this.listeners = {}

        this.addListener = this.addListener.bind(this)
        this.on = this.on.bind(this)
        this.emit = this.emit.bind(this)
        this.removeListener = this.removeListener.bind(this)
        this.off = this.off.bind(this)
        this.once = this.once.bind(this)
        this.listernerCount = this.listernerCount.bind(this)
        this.rawListeners = this.rawListeners.bind(this)
    }

    addListener(event, fn) {
        this.listeners[event] = this.listeners[event] || []
        this.listeners[event].push(fn)
        return this
    }

    on(event, fn) {
        return this.addListener(event, fn)
    }

    emit(event, data) {
        const lis = this.listeners[event] || []

        lis.forEach((fn) => {
            fn({ eventName: event, ...data })
        })

        return this
    }

    removeListener(event, fn) {
        let lis = this.listeners[event]

        if (!lis) {
            return this
        }

        for (let i = lis.length; i > 0; i--) {
            if (lis[i] == fn) {
                lis.splice(i, 1)
                break
            }
        }

        return this
    }

    off(event, fn) {
        return this.removeListener(event, fn)
    }

    once(event, fn) {
        this.listeners[event] = this.listeners[event] || []

        const onceWrapper = (data) => {
            fn(data)
            this.off(event, onceWrapper)
        }

        this.listeners[event].push(onceWrapper)

        return this
    }

    listernerCount(event) {
        let fns = this.listeners[event] || []

        return fns.length
    }

    rawListeners(event) {
        return this.listeners[event]
    }
}
